package codewithhimanshu.ai.service;

import codewithhimanshu.ai.service.GroqClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class IntentDetectorService {

    private final GroqClient groqClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Data
    public static class DetectedIntent {
        private String intent;
        private Map<String, String> entities = new HashMap<>();
    }

    public DetectedIntent detectIntent(String userMessage) {
        DetectedIntent result = new DetectedIntent();
        if (userMessage == null || userMessage.trim().isEmpty()) {
            result.setIntent("GENERAL_QUERY");
            return result;
        }

        String prompt = "You are an Intent Detection and Entity Extraction service for a Hospital Management System AI Assistant (Jarvis).\n" +
                "Analyze the user's spoken input and classify it into EXACTLY ONE of these supported intents:\n" +
                "- SHOW_PATIENT (e.g., 'Show patient Himanshu', 'Open patient ID 1001', 'Find patient 102')\n" +
                "- CREATE_PATIENT (e.g., 'Create a new patient', 'Add patient Ramesh')\n" +
                "- SHOW_DOCTORS (e.g., 'Show available doctors', 'List all cardiologists')\n" +
                "- CHECK_DOCTOR_AVAILABILITY (e.g., 'Is Dr Raj available today')\n" +
                "- BOOK_APPOINTMENT (e.g., 'Book appointment with cardiologist tomorrow', 'Schedule visit with Dr Sharma')\n" +
                "- CHECK_MEDICINE_STOCK (e.g., 'Check Paracetamol stock', 'Do we have Amoxicillin')\n" +
                "- LOW_STOCK_ALERT (e.g., 'Show low stock medicines', 'Check out of stock drugs')\n" +
                "- SEND_EMAIL (e.g., 'Send email to all doctors', 'Send emergency notice', 'Ask nurses about availability')\n" +
                "- SHOW_REVENUE (e.g., 'Print today revenue', 'Show earnings')\n" +
                "- GENERATE_BILL (e.g., 'Generate bill for Patient 102', 'Create invoice for patient 101')\n" +
                "- SHOW_NURSES (e.g., 'Show ICU nurses', 'List available nurses')\n" +
                "- MARK_NURSE_AVAILABLE (e.g., 'Mark Nurse Priya as available', 'Set Nurse Rahul status active')\n" +
                "- SHOW_APPOINTMENTS (e.g., 'Show Dr Sharma appointments', 'List today appointments')\n" +
                "- GENERAL_QUERY (anything else)\n\n" +
                "Also extract entities if present: 'patientId', 'patientName', 'doctorName', 'nurseName', 'medicineName', 'specialization', 'ward', 'date'.\n\n" +
                "Return ONLY a JSON object without markdown code blocks:\n" +
                "{\n" +
                "  \"intent\": \"INTENT_NAME\",\n" +
                "  \"entities\": {\n" +
                "    \"patientName\": \"Himanshu\",\n" +
                "    \"patientId\": \"1001\"\n" +
                "  }\n" +
                "}\n\n" +
                "User input: \"" + userMessage + "\"";

        try {
            String aiResponse = groqClient.getChatCompletion(prompt, userMessage);
            if (aiResponse != null && !aiResponse.contains("Groq API Key is currently not configured")) {
                JsonNode root = objectMapper.readTree(aiResponse);
                if (root.has("intent")) {
                    result.setIntent(root.get("intent").asText().toUpperCase());
                }
                if (root.has("entities") && root.get("entities").isObject()) {
                    root.get("entities").fields().forEachRemaining(entry -> {
                        if (!entry.getValue().isNull()) {
                            result.getEntities().put(entry.getKey(), entry.getValue().asText());
                        }
                    });
                }
                if (result.getIntent() != null) {
                    return result;
                }
            }
        } catch (Exception e) {
            log.warn("AI Intent detection fallback due to parsing error: {}", e.getMessage());
        }

        // Fallback rule-based detection
        return ruleBasedFallback(userMessage);
    }

    private DetectedIntent ruleBasedFallback(String msg) {
        DetectedIntent result = new DetectedIntent();
        String lower = msg.toLowerCase().trim();

        if (lower.contains("patient")) {
            if (lower.contains("create") || lower.contains("add") || lower.contains("new")) {
                result.setIntent("CREATE_PATIENT");
            } else {
                result.setIntent("SHOW_PATIENT");
                extractTargetNameOrId(lower, result);
            }
        } else if (lower.contains("doctor") || lower.contains("dr") || lower.contains("cardiologist") || lower.contains("physician")) {
            if (lower.contains("book") || lower.contains("appointment") || lower.contains("schedule")) {
                result.setIntent("BOOK_APPOINTMENT");
            } else if (lower.contains("available") || lower.contains("free") || lower.contains("is dr")) {
                result.setIntent("CHECK_DOCTOR_AVAILABILITY");
            } else {
                result.setIntent("SHOW_DOCTORS");
            }
            extractTargetNameOrId(lower, result);
        } else if (lower.contains("nurse") || lower.contains("icu")) {
            if (lower.contains("mark") || lower.contains("available") || lower.contains("assign")) {
                result.setIntent("MARK_NURSE_AVAILABLE");
            } else {
                result.setIntent("SHOW_NURSES");
            }
            extractTargetNameOrId(lower, result);
        } else if (lower.contains("stock") || lower.contains("medicine") || lower.contains("paracetamol") || lower.contains("pharmacy") || lower.contains("drug")) {
            if (lower.contains("low") || lower.contains("out of") || lower.contains("alert")) {
                result.setIntent("LOW_STOCK_ALERT");
            } else {
                result.setIntent("CHECK_MEDICINE_STOCK");
                if (lower.contains("paracetamol")) result.getEntities().put("medicineName", "Paracetamol");
            }
        } else if (lower.contains("bill") || lower.contains("revenue") || lower.contains("invoice") || lower.contains("unpaid")) {
            if (lower.contains("revenue") || lower.contains("earning") || lower.contains("income")) {
                result.setIntent("SHOW_REVENUE");
            } else {
                result.setIntent("GENERATE_BILL");
                extractTargetNameOrId(lower, result);
            }
        } else if (lower.contains("email") || lower.contains("notice") || lower.contains("send") || lower.contains("mail")) {
            result.setIntent("SEND_EMAIL");
        } else if (lower.contains("appointment")) {
            result.setIntent("SHOW_APPOINTMENTS");
        } else {
            result.setIntent("GENERAL_QUERY");
        }

        return result;
    }

    private void extractTargetNameOrId(String lower, DetectedIntent result) {
        String[] words = lower.split("\\s+");
        for (int i = 0; i < words.length; i++) {
            if (words[i].matches("\\d+")) {
                result.getEntities().put("patientId", words[i]);
                result.getEntities().put("id", words[i]);
            }
        }
    }
}
