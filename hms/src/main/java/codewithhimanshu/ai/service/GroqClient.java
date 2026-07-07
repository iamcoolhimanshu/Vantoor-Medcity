package codewithhimanshu.ai.service;

import codewithhimanshu.ai.entity.Conversation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class GroqClient {

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    public String getChatCompletion(String systemPrompt, List<Conversation> history) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.startsWith("gsk_fake")) {
            log.warn("Groq API key is missing or is placeholder. Returning mock response.");
            return "{" +
                   "\"reply\": \"Welcome! The Groq API Key is currently not configured or is a placeholder. Please configure a valid 'groq.api.key' in your application.properties file to enable full AI function capability.\"," +
                   "\"action\": \"GENERAL_QUERY\"," +
                   "\"data\": {}" +
                   "}";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);

            List<Map<String, String>> messages = new ArrayList<>();

            // System prompt
            Map<String, String> sysMsg = new HashMap<>();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);
            messages.add(sysMsg);

            // History
            for (Conversation chat : history) {
                Map<String, String> msg = new HashMap<>();
                msg.put("role", chat.getRole());
                msg.put("content", chat.getMessage());
                messages.add(msg);
            }

            requestBody.put("messages", messages);

            // Force JSON output
            Map<String, String> responseFormat = new HashMap<>();
            responseFormat.put("type", "json_object");
            requestBody.put("response_format", responseFormat);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Sending request to Groq with model: {}", model);
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_URL, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List choices = (List) body.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map firstChoice = (Map) choices.get(0);
                    Map message = (Map) firstChoice.get("message");
                    if (message != null) {
                        return (String) message.get("content");
                    }
                }
            }
            throw new RuntimeException("Empty or invalid response from Groq API");

        } catch (Exception e) {
            log.error("Error calling Groq API: {}", e.getMessage(), e);
            return "{" +
                   "\"reply\": \"Oops! I encountered an error communicating with the AI service: " + e.getMessage() + "\"," +
                   "\"action\": \"GENERAL_QUERY\"," +
                   "\"data\": {}" +
                   "}";
        }
    }

    public String getChatCompletion(String systemPrompt, String userMessage) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.startsWith("gsk_fake")) {
            log.warn("Groq API key is missing or is placeholder. Returning mock response.");
            return "{" +
                   "\"recommendations\": [" +
                   "  {\"medicine\": \"Paracetamol\", \"purpose\": \"Reduce fever\", \"dosage\": \"500mg - Twice daily - 3 days\", \"confidence\": 95}," +
                   "  {\"medicine\": \"Cough Syrup\", \"purpose\": \"Relieve cough\", \"dosage\": \"10ml - Thrice daily - 5 days\", \"confidence\": 88}" +
                   "]," +
                   "\"warnings\": []," +
                   "\"reasoning\": \"The patient presents with fever and cough. Paracetamol is recommended for fever control, and Cough Syrup for symptom relief. No allergies or interactions detected.\"" +
                   "}";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);

            List<Map<String, String>> messages = new ArrayList<>();

            // System prompt
            Map<String, String> sysMsg = new HashMap<>();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);
            messages.add(sysMsg);

            // User prompt
            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);
            messages.add(userMsg);

            requestBody.put("messages", messages);

            // Force JSON output
            Map<String, String> responseFormat = new HashMap<>();
            responseFormat.put("type", "json_object");
            requestBody.put("response_format", responseFormat);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Sending request to Groq with model: {}", model);
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_URL, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List choices = (List) body.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map firstChoice = (Map) choices.get(0);
                    Map message = (Map) firstChoice.get("message");
                    if (message != null) {
                        return (String) message.get("content");
                    }
                }
            }
            throw new RuntimeException("Empty or invalid response from Groq API");

        } catch (Exception e) {
            log.error("Error calling Groq API: {}", e.getMessage(), e);
            return "{" +
                   "\"recommendations\": []," +
                   "\"warnings\": [{\"warning\": \"Error communicating with AI service: " + e.getMessage() + "\"}]," +
                   "\"reasoning\": \"AI recommendation failed due to API communication error.\"" +
                   "}";
        }
    }
}
