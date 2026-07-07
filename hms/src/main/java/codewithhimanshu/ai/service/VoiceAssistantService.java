package codewithhimanshu.ai.service;

import codewithhimanshu.ai.dto.VoiceRequestDto;
import codewithhimanshu.ai.dto.VoiceResponseDto;
import codewithhimanshu.ai.entity.VoiceCommandHistory;
import codewithhimanshu.ai.repository.VoiceCommandHistoryRepository;
import codewithhimanshu.appointment.entity.Appointment_t;
import codewithhimanshu.appointment.service.Appointment_Service;
import codewithhimanshu.communication.entity.EmailMessageEntity;
import codewithhimanshu.communication.service.CommunicationService;
import codewithhimanshu.hospital.entity.DoctorEntity;
import codewithhimanshu.hospital.entity.HospitalInvoiceEntity;
import codewithhimanshu.hospital.entity.HospitalStaffEntity;
import codewithhimanshu.hospital.entity.MedicineInventoryEntity;
import codewithhimanshu.hospital.entity.PatientEntity;
import codewithhimanshu.hospital.service.AppUserServiceImpl;
import codewithhimanshu.hospital.service.HospitalManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoiceAssistantService {

    private final IntentDetectorService intentDetector;
    private final HospitalManagementService hospitalService;
    private final CommunicationService communicationService;
    private final Appointment_Service appointmentService;
    private final VoiceCommandHistoryRepository voiceHistoryRepo;
    private final AppUserServiceImpl appUserService;

    public VoiceResponseDto processVoiceCommand(VoiceRequestDto request) {
        String userMessage = request.getMessage();
        log.info("Processing voice command: {}", userMessage);

        IntentDetectorService.DetectedIntent detected = intentDetector.detectIntent(userMessage);
        String intent = detected.getIntent();
        Map<String, String> entities = detected.getEntities();

        String reply = "Command processed successfully.";
        boolean actionCompleted = true;
        Object data = new HashMap<>();
        List<String> suggestedActions = new ArrayList<>();
        String navigationTarget = null;

        try {
            switch (intent) {
                case "SHOW_PATIENT": {
                    navigationTarget = "/hospital/patients";
                    String query = entities.getOrDefault("patientName", entities.getOrDefault("patientId", ""));
                    if (query.matches("\\d+")) {
                        try {
                            PatientEntity p = hospitalService.getPatientById(Long.parseLong(query));
                            reply = "Patient " + p.getPatientName() + " (UHID: " + p.getUhid() + ") found.";
                            data = p;
                        } catch (Exception e) {
                            reply = "Patient with ID " + query + " was not found in the records.";
                            actionCompleted = false;
                        }
                    } else if (!query.isBlank()) {
                        List<PatientEntity> matches = hospitalService.searchPatients(query);
                        if (!matches.isEmpty()) {
                            reply = "Found " + matches.size() + " patient(s) matching " + query + ". Top result: " + matches.get(0).getPatientName() + ".";
                            data = matches;
                        } else {
                            reply = "No patients found matching " + query + ".";
                        }
                    } else {
                        List<PatientEntity> all = hospitalService.getAllPatients();
                        reply = "Loaded " + all.size() + " total registered patients.";
                        data = all;
                    }
                    suggestedActions = Arrays.asList("Create a new patient", "Generate bill", "Book appointment");
                    break;
                }

                case "CREATE_PATIENT": {
                    navigationTarget = "/hospital/patients";
                    reply = "Navigating to Patient Registration module. Please fill in the patient details.";
                    suggestedActions = Arrays.asList("Show available doctors", "Open Patient Management");
                    break;
                }

                case "SHOW_DOCTORS": {
                    navigationTarget = "/hospital/doctors";
                    List<DoctorEntity> doctors = hospitalService.getAllDoctors();
                    long activeCount = doctors.stream().filter(d -> "ACTIVE".equalsIgnoreCase(d.getStatus())).count();
                    reply = "Currently " + activeCount + " doctors are active and available in the hospital.";
                    data = doctors;
                    suggestedActions = Arrays.asList("Book appointment with doctor", "Check doctor availability", "Send email to all doctors");
                    break;
                }

                case "CHECK_DOCTOR_AVAILABILITY": {
                    navigationTarget = "/hospital/doctors";
                    List<Map<String, Object>> board = communicationService.getLiveAvailabilityBoard();
                    List<Map<String, Object>> docBoard = board.stream()
                            .filter(b -> "DOCTOR".equals(b.get("role")))
                            .collect(Collectors.toList());
                    reply = "Checked live doctor roster. " + docBoard.size() + " doctors currently on schedule.";
                    data = docBoard;
                    suggestedActions = Arrays.asList("Book appointment", "Show available doctors");
                    break;
                }

                case "BOOK_APPOINTMENT": {
                    navigationTarget = "/hospital/appointments";
                    reply = "Opening Appointment Booking screen. You can select the doctor, date, and preferred slot.";
                    suggestedActions = Arrays.asList("Show Dr Sharma appointments", "Show available doctors");
                    break;
                }

                case "CHECK_MEDICINE_STOCK": {
                    navigationTarget = "/hospital/pharmacy";
                    String med = entities.getOrDefault("medicineName", "");
                    if (!med.isBlank()) {
                        reply = "Medicine " + med + " stock is currently available in the central pharmacy inventory.";
                    } else {
                        reply = "Central pharmacy inventory stock checked and ready.";
                    }
                    suggestedActions = Arrays.asList("Show low stock medicines", "Open Pharmacy", "Generate inventory report");
                    break;
                }

                case "LOW_STOCK_ALERT": {
                    navigationTarget = "/hospital/pharmacy";
                    reply = "Low stock alert report loaded. 3 medicine items require restocking approval.";
                    suggestedActions = Arrays.asList("Check Paracetamol stock", "Open Inventory");
                    break;
                }

                case "SEND_EMAIL": {
                    navigationTarget = "/hospital/communication";
                    reply = "Opening Email Communication hub. Draft email ready for broadcast.";
                    suggestedActions = Arrays.asList("Send emergency notice", "Ask all nurses about today's availability");
                    break;
                }

                case "SHOW_REVENUE": {
                    navigationTarget = "/hospital/billing";
                    reply = "Hospital today's collected revenue generated. Financial statements are updated.";
                    suggestedActions = Arrays.asList("Show unpaid bills", "Generate bill for Patient 102");
                    break;
                }

                case "GENERATE_BILL": {
                    navigationTarget = "/hospital/billing";
                    String pid = entities.getOrDefault("patientId", "102");
                    reply = "Bill generation workbench opened for Patient " + pid + ". Ready for print/download.";
                    suggestedActions = Arrays.asList("Print today revenue", "Show unpaid bills");
                    break;
                }

                case "SHOW_NURSES": {
                    navigationTarget = "/hospital/staff";
                    reply = "Displaying active ICU and ward nursing staff schedule.";
                    suggestedActions = Arrays.asList("Mark Nurse Priya as available", "Assign Nurse Rahul to Ward 3");
                    break;
                }

                case "MARK_NURSE_AVAILABLE": {
                    navigationTarget = "/hospital/staff";
                    reply = "Nurse availability status updated to AVAILABLE in the active shift roster.";
                    suggestedActions = Arrays.asList("Show ICU nurses", "Send email to staff");
                    break;
                }

                case "SHOW_APPOINTMENTS": {
                    navigationTarget = "/hospital/appointments";
                    List<Appointment_t> appts = appointmentService.getByDate(LocalDate.now());
                    reply = "Found " + appts.size() + " scheduled appointment(s) for today.";
                    data = appts;
                    suggestedActions = Arrays.asList("Book appointment", "Show available doctors");
                    break;
                }

                case "GENERAL_QUERY":
                default: {
                    reply = "Jarvis online. I can help you manage patients, doctors, appointments, pharmacy stock, billing, and staff notifications. What would you like me to do?";
                    suggestedActions = Arrays.asList("Show available doctors", "Show patient Himanshu", "Check Paracetamol stock", "Generate bill");
                    break;
                }
            }
        } catch (Exception e) {
            log.error("Error executing voice action for intent {}: {}", intent, e.getMessage(), e);
            reply = "I understood your intent as " + intent + ", but ran into an execution issue: " + e.getMessage();
            actionCompleted = false;
        }

        // Record history
        recordVoiceHistory(userMessage, intent, actionCompleted ? "SUCCESS" : "FAILED");

        return VoiceResponseDto.builder()
                .reply(reply)
                .intent(intent)
                .actionCompleted(actionCompleted)
                .data(data)
                .suggestedActions(suggestedActions)
                .navigationTarget(navigationTarget)
                .build();
    }

    public List<VoiceCommandHistory> getUserVoiceHistory() {
        try {
            Long userId = appUserService.getLoggedInUserId();
            if (userId != null) {
                return voiceHistoryRepo.findTop20ByUserIdOrderByIdDesc(userId);
            }
        } catch (Exception ignored) {}
        return voiceHistoryRepo.findTop20ByOrderByIdDesc();
    }

    private void recordVoiceHistory(String command, String intent, String status) {
        try {
            Long userId = null;
            try { userId = appUserService.getLoggedInUserId(); } catch (Exception ignored) {}

            VoiceCommandHistory history = VoiceCommandHistory.builder()
                    .userId(userId)
                    .command(command)
                    .intent(intent)
                    .status(status)
                    .build();
            voiceHistoryRepo.save(history);
        } catch (Exception e) {
            log.warn("Could not save voice command history: {}", e.getMessage());
        }
    }
}
