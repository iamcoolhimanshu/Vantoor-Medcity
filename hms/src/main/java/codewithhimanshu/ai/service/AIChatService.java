package codewithhimanshu.ai.service;

import codewithhimanshu.ai.dto.AIChatRequest;
import codewithhimanshu.ai.dto.AIChatResponse;
import codewithhimanshu.ai.entity.Conversation;
import codewithhimanshu.ai.repository.ConversationRepository;
import codewithhimanshu.appointment.entity.Appointment_t;
import codewithhimanshu.appointment.entity.BookingProfile_t;
import codewithhimanshu.appointment.repository.Appointment_Repository;
import codewithhimanshu.appointment.repository.BookingProfileRepository;
import codewithhimanshu.appointment.service.AvailabilityService;
import codewithhimanshu.appointment.service.Appointment_Service;
import codewithhimanshu.appointment.service.CalendlyAppointmentService;
import codewithhimanshu.appointment.dto.AvailableSlotsResponse;
import codewithhimanshu.appointment.dto.RescheduleRequest;
import codewithhimanshu.hospital.entity.DoctorEntity;
import codewithhimanshu.hospital.repository.DoctorRepository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
public class AIChatService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private GroqClient groqClient;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private BookingProfileRepository bookingProfileRepository;

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private Appointment_Service appointmentService;

    @Autowired
    private Appointment_Repository appointmentRepository;

    @Autowired
    private CalendlyAppointmentService calendlyAppointmentService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public AIChatResponse processChatMessage(AIChatRequest request) {
        String sessionId = request.getSessionId();
        String userMessage = request.getMessage();

        log.info("Received chat message for session {}: {}", sessionId, userMessage);

        // 1. Save user's message
        conversationRepository.save(Conversation.builder()
                .sessionId(sessionId)
                .role("user")
                .message(userMessage)
                .build());

        // 2. Fetch full history for LLM prompt context
        List<Conversation> history = conversationRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        // Create a processed history to send to Groq (unwrap saved JSON assistant messages to pure text)
        List<Conversation> cleanedHistory = new ArrayList<>();
        for (Conversation conv : history) {
            String cleanText = conv.getMessage();
            if ("assistant".equals(conv.getRole()) && cleanText.trim().startsWith("{")) {
                try {
                    JsonNode node = objectMapper.readTree(cleanText);
                    if (node.has("reply")) {
                        cleanText = node.get("reply").asText();
                    }
                } catch (Exception ignored) {}
            }
            cleanedHistory.add(Conversation.builder()
                    .role(conv.getRole())
                    .message(cleanText)
                    .build());
        }

        // 3. Build system prompt
        String systemPrompt = buildSystemPrompt();

        // 4. Call Groq
        String rawLLMResponse = groqClient.getChatCompletion(systemPrompt, cleanedHistory);
        log.info("Raw LLM Response: {}", rawLLMResponse);

        // 5. Parse LLM response
        AIChatResponse response;
        try {
            response = objectMapper.readValue(rawLLMResponse, AIChatResponse.class);
        } catch (Exception e) {
            log.error("Failed to parse LLM response as JSON. Response: {}. Error: {}", rawLLMResponse, e.getMessage());
            response = AIChatResponse.builder()
                    .reply("I'm sorry, I had trouble processing that request. Can you please specify what you would like to do?")
                    .action("GENERAL_QUERY")
                    .data(new HashMap<>())
                    .build();
        }

        // 6. Execute actions based on intent
        executeActionLayer(response, history);

        // 7. Save assistant response (save full JSON response for context preservation)
        try {
            String assistantJson = objectMapper.writeValueAsString(response);
            conversationRepository.save(Conversation.builder()
                    .sessionId(sessionId)
                    .role("assistant")
                    .message(assistantJson)
                    .build());
        } catch (Exception e) {
            log.error("Failed to save assistant response JSON: {}", e.getMessage());
            conversationRepository.save(Conversation.builder()
                    .sessionId(sessionId)
                    .role("assistant")
                    .message(response.getReply())
                    .build());
        }

        return response;
    }

    private String buildSystemPrompt() {
        String todayStr = LocalDate.now().toString();
        return "You are an AI Appointment Chatbot for a Hospital Management System. Your job is to assist patients in booking, rescheduling, and cancelling appointments, as well as answering hospital-related questions.\n" +
               "TODAY'S DATE IS: " + todayStr + " (Use this date to compute relative terms like 'tomorrow', 'next Monday', etc.)\n\n" +
               "Rules & Capabilities:\n" +
               "1. Symptom Routing:\n" +
               "   - Chest Pain -> Cardiology\n" +
               "   - Skin Rash -> Dermatology\n" +
               "   - Fever -> General Medicine\n" +
               "   - Headache -> Neurology\n" +
               "   - Eye Pain -> Ophthalmology\n" +
               "   If the symptoms are unclear, ask follow-up questions to clarify. Recommend the matching department and ask if they want to check available doctors/slots.\n\n" +
               "2. Hospital Timings & Consultation Fees:\n" +
               "   - Timings: Outpatient (OPD) consultation timings are Monday to Friday, 9:00 AM to 6:00 PM. Emergency and IPD services are open 24/7.\n" +
               "   - Consultation Fees: Doctor consultation fee is $50.\n\n" +
               "3. Slot Checking:\n" +
               "   - When the user asks for available doctors, slots, or expresses intent to book for a department or doctor, you must set action to 'CHECK_SLOTS'.\n" +
               "   - Extract 'specialization' (e.g. 'Cardiology') or 'doctorName' (e.g. 'Dr. Sharma') and 'date' (format YYYY-MM-DD) into the 'data' field. If the user doesn't specify a date, default to tomorrow's date.\n\n" +
               "4. Booking Appointments:\n" +
               "   - When the user selects a slot (e.g., '10:00 AM', '11 AM') or confirms booking details, set action to 'BOOK_APPOINTMENT'.\n" +
               "   - Extract 'time' (format HH:mm, e.g. '10:00') and 'date' (YYYY-MM-DD). If name/email are not in message or history, ask the user to provide their full name and email to proceed.\n" +
               "   - If they provide name/email, extract 'customerName', 'customerEmail', and 'customerPhone'.\n\n" +
               "5. Rescheduling Appointments:\n" +
               "   - Set action to 'RESCHEDULE_APPOINTMENT'.\n" +
               "   - Extract 'appointmentNumber' (e.g. 'APT-2026-001'), 'newDate' (YYYY-MM-DD), and 'newStart' (HH:mm).\n\n" +
               "6. Cancelling Appointments:\n" +
               "   - Set action to 'CANCEL_APPOINTMENT'.\n" +
               "   - Extract 'appointmentNumber' (e.g. 'APT-2026-001').\n\n" +
               "You MUST respond ONLY with a JSON object in this exact schema, do not include any other markdown outside the JSON:\n" +
               "{\n" +
               "  \"reply\": \"Friendly conversational text response here.\",\n" +
               "  \"action\": \"CHECK_SLOTS | BOOK_APPOINTMENT | RESCHEDULE_APPOINTMENT | CANCEL_APPOINTMENT | GENERAL_QUERY | SYMPTOM_ROUTING\",\n" +
               "  \"data\": {\n" +
               "    \"specialization\": \"Cardiology | Dermatology | General Medicine | Neurology | Ophthalmology\",\n" +
               "    \"doctorName\": \"string (optional)\",\n" +
               "    \"date\": \"YYYY-MM-DD (optional)\",\n" +
               "    \"time\": \"HH:mm (optional)\",\n" +
               "    \"appointmentNumber\": \"string (optional)\",\n" +
               "    \"customerName\": \"string (optional)\",\n" +
               "    \"customerEmail\": \"string (optional)\",\n" +
               "    \"customerPhone\": \"string (optional)\",\n" +
               "    \"newDate\": \"YYYY-MM-DD (optional)\",\n" +
               "    \"newStart\": \"HH:mm (optional)\"\n" +
               "  }\n" +
               "}";
    }

    private void executeActionLayer(AIChatResponse response, List<Conversation> history) {
        String action = response.getAction();
        Map<String, Object> data = response.getData();
        if (data == null) {
            data = new HashMap<>();
            response.setData(data);
        }

        try {
            if ("CHECK_SLOTS".equals(action)) {
                handleCheckSlotsAction(response, data);
            } else if ("BOOK_APPOINTMENT".equals(action)) {
                handleBookAppointmentAction(response, data, history);
            } else if ("CANCEL_APPOINTMENT".equals(action)) {
                handleCancelAppointmentAction(response, data);
            } else if ("RESCHEDULE_APPOINTMENT".equals(action)) {
                handleRescheduleAppointmentAction(response, data);
            }
        } catch (Exception e) {
            log.error("Error executing backend action: {}", e.getMessage(), e);
            response.setReply("I encountered an issue executing that action: " + e.getMessage() + ". Please check the details and try again.");
            response.setAction("GENERAL_QUERY");
        }
    }

    private void handleCheckSlotsAction(AIChatResponse response, Map<String, Object> data) {
        String spec = (String) data.get("specialization");
        String docName = (String) data.get("doctorName");
        String dateStr = (String) data.get("date");

        LocalDate date = (dateStr != null && !dateStr.isEmpty()) ? 
                LocalDate.parse(dateStr, DATE_FORMATTER) : LocalDate.now().plusDays(1);
        data.put("date", date.toString());

        // Find matching booking profile
        BookingProfile_t profile = findMatchingBookingProfile(spec, docName);

        if (profile == null) {
            response.setReply("I searched for available doctors under " + (spec != null ? spec : "") + " " + (docName != null ? docName : "") + " but could not find an active booking schedule. Please try another department or doctor.");
            response.setAction("GENERAL_QUERY");
            return;
        }

        // Get slots
        AvailableSlotsResponse slotsResp = availabilityService.getAvailableSlots(profile.getId(), date);
        List<String> availableTimes = new ArrayList<>();
        if (slotsResp.getSlots() != null) {
            for (AvailableSlotsResponse.SlotDto slot : slotsResp.getSlots()) {
                if (Boolean.TRUE.equals(slot.isAvailable())) {
                    availableTimes.add(slot.getStartTime());
                }
            }
        }

        data.put("bookingProfileId", profile.getId());
        data.put("doctorName", profile.getResourceName() != null ? profile.getResourceName() : profile.getName());
        data.put("specialization", spec != null ? spec : "General Medicine");
        data.put("slots", availableTimes);

        if (availableTimes.isEmpty()) {
            response.setReply("I found " + profile.getResourceName() + " (" + spec + ") but there are no available slots on " + date.toString() + ". Please choose another date.");
        } else {
            response.setReply("Here are the available slots for " + profile.getResourceName() + " (" + (spec != null ? spec : "Consultation") + ") on " + date.toString() + ". Please select one to proceed.");
        }
    }

    private void handleBookAppointmentAction(AIChatResponse response, Map<String, Object> data, List<Conversation> history) {
        String timeStr = (String) data.get("time");
        String dateStr = (String) data.get("date");
        String customerName = (String) data.get("customerName");
        String customerEmail = (String) data.get("customerEmail");
        String customerPhone = (String) data.get("customerPhone");

        // Attempt to extract bookingProfileId and date from history if not present in the LLM response
        Long bookingProfileId = null;
        if (data.containsKey("bookingProfileId") && data.get("bookingProfileId") != null) {
            bookingProfileId = Long.valueOf(data.get("bookingProfileId").toString());
        }

        LocalDate date = (dateStr != null && !dateStr.isEmpty()) ? LocalDate.parse(dateStr, DATE_FORMATTER) : null;

        if (bookingProfileId == null || date == null) {
            // Scan history backwards
            for (int i = history.size() - 1; i >= 0; i--) {
                Conversation conv = history.get(i);
                if ("assistant".equals(conv.getRole()) && conv.getMessage().trim().startsWith("{")) {
                    try {
                        JsonNode node = objectMapper.readTree(conv.getMessage());
                        if (node.has("data")) {
                            JsonNode dataNode = node.get("data");
                            if (bookingProfileId == null && dataNode.has("bookingProfileId")) {
                                bookingProfileId = dataNode.get("bookingProfileId").asLong();
                            }
                            if (date == null && dataNode.has("date")) {
                                date = LocalDate.parse(dataNode.get("date").asText(), DATE_FORMATTER);
                            }
                        }
                    } catch (Exception ignored) {}
                }
            }
        }

        if (bookingProfileId == null) {
            response.setReply("I couldn't find a doctor profile selected. Please state which doctor or department you want to book an appointment with first.");
            response.setAction("GENERAL_QUERY");
            return;
        }

        if (date == null) {
            date = LocalDate.now().plusDays(1);
        }

        if (timeStr == null || timeStr.isEmpty()) {
            response.setReply("What time would you like to book? Please pick an available slot.");
            response.setAction("CHECK_SLOTS");
            data.put("bookingProfileId", bookingProfileId);
            data.put("date", date.toString());
            return;
        }

        LocalTime time = LocalTime.parse(timeStr, TIME_FORMATTER);

        // We require customerName and customerEmail to save an appointment
        if (customerName == null || customerName.trim().isEmpty() || customerEmail == null || customerEmail.trim().isEmpty()) {
            // Check history for details
            for (int i = history.size() - 1; i >= 0; i--) {
                Conversation conv = history.get(i);
                if ("assistant".equals(conv.getRole()) && conv.getMessage().trim().startsWith("{")) {
                    try {
                        JsonNode node = objectMapper.readTree(conv.getMessage());
                        if (node.has("data")) {
                            JsonNode dataNode = node.get("data");
                            if ((customerName == null || customerName.isEmpty()) && dataNode.has("customerName")) {
                                customerName = dataNode.get("customerName").asText();
                            }
                            if ((customerEmail == null || customerEmail.isEmpty()) && dataNode.has("customerEmail")) {
                                customerEmail = dataNode.get("customerEmail").asText();
                            }
                            if ((customerPhone == null || customerPhone.isEmpty()) && dataNode.has("customerPhone")) {
                                customerPhone = dataNode.get("customerPhone").asText();
                            }
                        }
                    } catch (Exception ignored) {}
                }
            }
        }

        if (customerName == null || customerName.trim().isEmpty() || customerEmail == null || customerEmail.trim().isEmpty()) {
            response.setReply("To finalize booking at " + timeStr + ", please provide your full name and email address.");
            data.put("bookingProfileId", bookingProfileId);
            data.put("date", date.toString());
            data.put("time", timeStr);
            return;
        }

        // Retrieve profile
        BookingProfile_t profile = bookingProfileRepository.findById(bookingProfileId)
                .orElseThrow(() -> new RuntimeException("Selected doctor profile was not found."));

        // Build appointment
        Appointment_t appt = new Appointment_t();
        appt.setBookingProfileId(profile.getId());
        appt.setAppointmentDate(date);
        appt.setStartTime(time);
        appt.setEndTime(time.plusMinutes(profile.getMeetingDurationMinutes() != null ? profile.getMeetingDurationMinutes() : 30));
        appt.setDurationMinutes(profile.getMeetingDurationMinutes());
        appt.setServiceName(profile.getServiceName() != null ? profile.getServiceName() : profile.getName());
        appt.setServiceItemId(profile.getServiceItemId());
        appt.setResourceId(profile.getResourceId());
        appt.setResourceName(profile.getResourceName() != null ? profile.getResourceName() : profile.getName());
        appt.setAccountId(profile.getAccountId());
        appt.setCustomerName(customerName);
        appt.setCustomerEmail(customerEmail);
        appt.setCustomerPhone(customerPhone != null ? customerPhone : "");
        appt.setTimezone(profile.getTimezone());
        appt.setBookedByType("VISITOR");
        appt.setSource("CHATBOT");

        // Book
        Appointment_t saved = appointmentService.bookAppointment(appt);

        data.put("appointmentId", saved.getId());
        data.put("appointmentNumber", saved.getAppointmentNumber());
        data.put("doctorName", saved.getResourceName());
        data.put("date", saved.getAppointmentDate().toString());
        data.put("startTime", saved.getStartTime().toString());
        data.put("status", saved.getStatus());

        response.setReply("Appointment booked successfully! Doctor: " + saved.getResourceName() +
                          ". Date: " + saved.getAppointmentDate().toString() +
                          ", Time: " + saved.getStartTime().toString() +
                          ". Your Appointment Reference is " + saved.getAppointmentNumber() + ".");
    }

    private void handleCancelAppointmentAction(AIChatResponse response, Map<String, Object> data) {
        String apptNo = (String) data.get("appointmentNumber");
        if (apptNo == null || apptNo.trim().isEmpty()) {
            response.setReply("Please provide the Appointment Reference Number (e.g. APT-xxxx) you want to cancel.");
            return;
        }

        Optional<Appointment_t> apptOpt = appointmentRepository.findByAppointmentNumber(apptNo);
        if (apptOpt.isEmpty()) {
            response.setReply("I could not find an active appointment with Reference Number: " + apptNo + ". Please verify the number.");
            return;
        }

        Appointment_t appt = apptOpt.get();
        Appointment_t cancelled = calendlyAppointmentService.cancel(appt.getId(), "Cancelled via AI Chatbot request", "visitor");

        data.put("appointmentNumber", cancelled.getAppointmentNumber());
        data.put("status", cancelled.getStatus());
        response.setReply("Appointment " + apptNo + " has been successfully cancelled.");
    }

    private void handleRescheduleAppointmentAction(AIChatResponse response, Map<String, Object> data) {
        String apptNo = (String) data.get("appointmentNumber");
        String newDateStr = (String) data.get("newDate");
        String newStartStr = (String) data.get("newStart");

        if (apptNo == null || apptNo.trim().isEmpty()) {
            response.setReply("Please specify the Appointment Reference Number you want to reschedule.");
            return;
        }

        Optional<Appointment_t> apptOpt = appointmentRepository.findByAppointmentNumber(apptNo);
        if (apptOpt.isEmpty()) {
            response.setReply("I couldn't find an appointment matching " + apptNo + ". Please check the reference number.");
            return;
        }

        Appointment_t oldAppt = apptOpt.get();

        if (newDateStr == null || newDateStr.isEmpty() || newStartStr == null || newStartStr.isEmpty()) {
            response.setReply("Please provide the new date and time you'd like to reschedule to. (For example: 'reschedule APT-xxx to tomorrow at 2:00 PM')");
            return;
        }

        RescheduleRequest rescheduleRequest = new RescheduleRequest();
        rescheduleRequest.setNewDate(newDateStr);
        rescheduleRequest.setNewStart(newStartStr);
        rescheduleRequest.setReason("Rescheduled via AI Chatbot");

        Appointment_t rescheduled = calendlyAppointmentService.reschedule(oldAppt.getId(), rescheduleRequest);

        data.put("oldAppointmentNumber", oldAppt.getAppointmentNumber());
        data.put("appointmentNumber", rescheduled.getAppointmentNumber());
        data.put("date", rescheduled.getAppointmentDate().toString());
        data.put("startTime", rescheduled.getStartTime().toString());
        data.put("status", rescheduled.getStatus());

        response.setReply("Appointment rescheduled successfully! New Appointment Reference is " + rescheduled.getAppointmentNumber() +
                          ". Date: " + rescheduled.getAppointmentDate().toString() +
                          ", Time: " + rescheduled.getStartTime().toString() + ".");
    }

    public List<Conversation> getConversationHistory(String sessionId) {
        return conversationRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    private BookingProfile_t findMatchingBookingProfile(String specialization, String doctorName) {
        List<BookingProfile_t> profiles = bookingProfileRepository.findAll();

        // 1. Try match by doctor name in profile resource name
        if (doctorName != null && !doctorName.trim().isEmpty()) {
            String targetDoc = doctorName.toLowerCase().replace("dr.", "").trim();
            for (BookingProfile_t p : profiles) {
                if (Boolean.TRUE.equals(p.getIsActive())) {
                    if (p.getResourceName() != null && p.getResourceName().toLowerCase().contains(targetDoc)) {
                        return p;
                    }
                    if (p.getName().toLowerCase().contains(targetDoc)) {
                        return p;
                    }
                }
            }
        }

        // 2. Try match by specialization
        if (specialization != null && !specialization.trim().isEmpty()) {
            String specLower = specialization.toLowerCase().trim();
            for (BookingProfile_t p : profiles) {
                if (Boolean.TRUE.equals(p.getIsActive())) {
                    if (p.getName().toLowerCase().contains(specLower)) {
                        return p;
                    }
                    if (p.getServiceName() != null && p.getServiceName().toLowerCase().contains(specLower)) {
                        return p;
                    }
                }
            }
        }

        // 3. Fallback: match by doctor table lookup and find corresponding profile
        if (specialization != null && !specialization.trim().isEmpty()) {
            List<DoctorEntity> doctors = doctorRepository.findAll();
            for (DoctorEntity doc : doctors) {
                if (doc.getSpecialization().toLowerCase().contains(specialization.toLowerCase())) {
                    // Try to find profile for this doctor
                    String docClean = doc.getDoctorName().toLowerCase().replace("dr.", "").trim();
                    for (BookingProfile_t p : profiles) {
                        if (Boolean.TRUE.equals(p.getIsActive())) {
                            if (p.getResourceName() != null && p.getResourceName().toLowerCase().contains(docClean)) {
                                return p;
                            }
                        }
                    }
                }
            }
        }

        // 4. Return first active profile as final fallback
        for (BookingProfile_t p : profiles) {
            if (Boolean.TRUE.equals(p.getIsActive())) {
                return p;
            }
        }

        return null;
    }
}
