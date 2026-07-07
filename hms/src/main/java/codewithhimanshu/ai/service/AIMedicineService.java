package codewithhimanshu.ai.service;

import codewithhimanshu.ai.dto.*;
import codewithhimanshu.ai.entity.RecommendationHistory;
import codewithhimanshu.ai.repository.RecommendationHistoryRepository;
import codewithhimanshu.hospital.entity.DoctorEntity;
import codewithhimanshu.hospital.entity.PatientEntity;
import codewithhimanshu.hospital.entity.PrescriptionEntity;
import codewithhimanshu.hospital.repository.DoctorRepository;
import codewithhimanshu.hospital.repository.PatientRepository;
import codewithhimanshu.hospital.repository.PrescriptionRepository;
import codewithhimanshu.hospital.service.AppUserServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIMedicineService {

    private final PatientRepository patientRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final DoctorRepository doctorRepository;
    private final RecommendationHistoryRepository historyRepository;
    private final AppUserServiceImpl appUserService;
    private final GroqClient groqClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public MedicineRecommendationResponse recommendMedicines(MedicineRecommendationRequest request) {
        log.info("Generating medicine recommendations for patient: {}", request.getPatientId());

        // 1. Load patient details
        Optional<PatientEntity> patientOpt = patientRepository.findById(request.getPatientId());
        if (patientOpt.isEmpty()) {
            return MedicineRecommendationResponse.builder()
                    .recommendations(new ArrayList<>())
                    .warnings(List.of(WarningDTO.builder().warning("Patient not found with ID: " + request.getPatientId()).build()))
                    .reasoning("Cannot proceed: Patient record is missing.")
                    .build();
        }
        PatientEntity patient = patientOpt.get();

        // 2. Load current medications from active prescriptions
        Long accountId = appUserService.getLoggedInUserAccountId();
        List<PrescriptionEntity> prescriptions = prescriptionRepository
                .findByPatientIdAndAccountIdAndIsDeletedFalse(patient.getPatientId(), accountId);

        String currentMedications = prescriptions.stream()
                .map(PrescriptionEntity::getMedicines)
                .filter(Objects::nonNull)
                .collect(Collectors.joining("; "));

        // 3. Build LLM prompt
        String systemPrompt = buildSystemPrompt();
        String userMessage = buildUserPrompt(patient, currentMedications, request);

        // 4. Call Groq API
        String rawResponse = groqClient.getChatCompletion(systemPrompt, userMessage);
        log.info("Raw LLM Medicine Recommendation Response: {}", rawResponse);

        // 5. Parse response and ensure safety fallback
        MedicineRecommendationResponse response;
        String cleanJson = stripMarkdown(rawResponse);
        try {
            response = objectMapper.readValue(cleanJson, MedicineRecommendationResponse.class);
        } catch (Exception e) {
            log.error("Failed to parse AI medicine response. Raw: {}, Cleaned: {}. Error: {}", rawResponse, cleanJson, e.getMessage());
            response = MedicineRecommendationResponse.builder()
                    .recommendations(new ArrayList<>())
                    .warnings(List.of(WarningDTO.builder().warning("AI parsing error. Please check inputs and retry.").build()))
                    .reasoning("Failed to parse structured JSON from AI provider.")
                    .build();
        }

        // 6. Resolve Doctor ID and Save History
        Long doctorId = resolveDoctorId(accountId);
        saveHistory(request, response, doctorId);

        return response;
    }

    public List<RecommendationHistory> getRecommendationHistory(Long patientId) {
        return historyRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    private String buildSystemPrompt() {
        return "You are an AI Clinical Medicine Recommendation Assistant for a Hospital Management System.\n" +
               "Your goal is to suggest appropriate medicines based on symptoms, diagnosis, patient demographics, and safety parameters.\n\n" +
               "AI SAFETY RULES:\n" +
               "Before recommending any medicine, you must perform these checks:\n" +
               "1. Drug Allergies: Check the patient's listed allergies. If a recommended medicine matches, is cross-reactive, or belongs to the same class as their allergies (e.g. Penicillin allergy vs. Amoxicillin), you must NOT recommend it. Instead, list a warning detailing the allergy conflict.\n" +
               "2. Drug Interactions: Check existing medications. If a recommended medicine has a known moderate-to-severe interaction with their current medications (e.g. Warfarin + Aspirin), you must NOT recommend it, and output a warning.\n" +
               "3. High-Risk Conditions & Demographics:\n" +
               "   - Pregnancy: Check if pregnancy or high-risk obstetric status is mentioned in medical history. Avoid teratogenic drugs (e.g. ACE inhibitors, statins, methotrexate).\n" +
               "   - Pediatric (Age < 12): Avoid adult-only formulations, and contraindicated pediatric drugs (e.g. tetracyclines, aspirin/Reye's syndrome).\n" +
               "   - Elderly (Age >= 65): Avoid highly sedative drugs or those high on the Beers Criteria (e.g. strong anticholinergics).\n\n" +
               "If a risk is detected, return a warning in the 'warnings' list and omit the high-risk drug from 'recommendations'.\n\n" +
               "AI RESPONSE FORMAT:\n" +
               "You MUST respond ONLY with a raw JSON object in the exact schema below. Do NOT wrap it in markdown code blocks like ```json ... ```. No plain text outside the JSON.\n" +
               "{\n" +
               "  \"recommendations\": [\n" +
               "    {\n" +
               "      \"medicine\": \"Medicine Name (e.g. Paracetamol)\",\n" +
               "      \"purpose\": \"Purpose of the suggestion (e.g. Reduce fever)\",\n" +
               "      \"dosage\": \"Suggested dosage instruction (e.g. 500mg - Twice daily - 3 days)\",\n" +
               "      \"confidence\": 95\n" +
               "    }\n" +
               "  ],\n" +
               "  \"warnings\": [\n" +
               "    {\n" +
               "      \"warning\": \"Warning detail here (e.g. Patient is allergic to Penicillin. Do not prescribe Amoxicillin.)\"\n" +
               "    }\n" +
               "  ],\n" +
               "  \"reasoning\": \"Clinical explanation of why these recommendations were made, considering symptoms, diagnosis, and patient state. Keep it clear, concise, and medical.\"\n" +
               "}\n" +
               "Note: Confidence score must be an integer between 0 and 100 representing clinical fit.";
    }

    private String buildUserPrompt(PatientEntity patient, String currentMedications, MedicineRecommendationRequest request) {
        String symptomsStr = request.getSymptoms() != null ? String.join(", ", request.getSymptoms()) : "None";
        String allergies = patient.getAllergies() != null && !patient.getAllergies().isBlank() ? patient.getAllergies() : "None";
        String history = patient.getMedicalHistory() != null && !patient.getMedicalHistory().isBlank() ? patient.getMedicalHistory() : "None";
        String currentMeds = currentMedications != null && !currentMedications.isBlank() ? currentMedications : "None";

        return String.format(
                "Patient Details:\n" +
                "- Age: %d\n" +
                "- Gender: %s\n" +
                "- Allergies: %s\n" +
                "- Medical History: %s\n" +
                "- Current Medications: %s\n\n" +
                "Encounter Details:\n" +
                "- Symptoms: %s\n" +
                "- Diagnosis: %s\n",
                patient.getAge() != null ? patient.getAge() : 0,
                patient.getGender() != null ? patient.getGender() : "Not Specified",
                allergies,
                history,
                currentMeds,
                symptomsStr,
                request.getDiagnosis() != null ? request.getDiagnosis() : "Not Specified"
        );
    }

    private String stripMarkdown(String rawJson) {
        if (rawJson == null) return "{}";
        rawJson = rawJson.trim();
        if (rawJson.startsWith("```")) {
            int firstNewLine = rawJson.indexOf('\n');
            if (firstNewLine != -1) {
                rawJson = rawJson.substring(firstNewLine).trim();
            }
            if (rawJson.endsWith("```")) {
                rawJson = rawJson.substring(0, rawJson.length() - 3).trim();
            }
        }
        return rawJson;
    }

    private Long resolveDoctorId(Long accountId) {
        try {
            if (accountId != null) {
                List<DoctorEntity> docs = doctorRepository.findByAccountIdAndIsDeletedFalse(accountId);
                if (!docs.isEmpty()) {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    String username = auth != null ? auth.getName() : "";
                    return docs.stream()
                            .filter(d -> d.getEmail() != null && d.getEmail().equalsIgnoreCase(username))
                            .map(DoctorEntity::getDoctorId)
                            .findFirst()
                            .orElse(docs.get(0).getDoctorId());
                }
            }
        } catch (Exception e) {
            log.warn("Could not resolve doctor ID: {}", e.getMessage());
        }
        return null;
    }

    private void saveHistory(MedicineRecommendationRequest request, MedicineRecommendationResponse response, Long doctorId) {
        try {
            String symptomsStr = request.getSymptoms() != null ? String.join(", ", request.getSymptoms()) : "";
            String responseStr = objectMapper.writeValueAsString(response);

            RecommendationHistory history = RecommendationHistory.builder()
                    .patientId(request.getPatientId())
                    .doctorId(doctorId)
                    .symptoms(symptomsStr)
                    .diagnosis(request.getDiagnosis())
                    .aiResponse(responseStr)
                    .build();

            historyRepository.save(history);
            log.info("Saved AI medicine recommendation history log successfully.");
        } catch (Exception e) {
            log.error("Failed to save recommendation history: {}", e.getMessage(), e);
        }
    }
}
