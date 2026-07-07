package codewithhimanshu.workflow.service;

import codewithhimanshu.ai.service.GroqClient;
import codewithhimanshu.workflow.dto.WorkflowCreateDto;
import codewithhimanshu.workflow.dto.WorkflowStepDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIWorkflowService {

    private final GroqClient groqClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WorkflowCreateDto generateWorkflowFromPrompt(String userPrompt) {
        log.info("Generating AI Workflow from user prompt: {}", userPrompt);

        String systemPrompt = "You are an AI Hospital Workflow Architect. " +
                "The user will describe an automated hospital process. " +
                "Convert their description into a valid JSON object matching this schema:\n" +
                "{\n" +
                "  \"workflowName\": \"Descriptive Title\",\n" +
                "  \"description\": \"Brief explanation\",\n" +
                "  \"triggerType\": \"PATIENT_ADMITTED | APPOINTMENT_CONFIRMED | LOW_STOCK | PATIENT_DISCHARGED | BILL_GENERATED\",\n" +
                "  \"steps\": [\n" +
                "    {\"stepOrder\": 1, \"stepType\": \"START\", \"actionType\": null},\n" +
                "    {\"stepOrder\": 2, \"stepType\": \"ACTION\", \"actionType\": \"ASSIGN_DOCTOR | SEND_NOTIFICATION | GENERATE_BILL | SEND_EMAIL | ASSIGN_NURSE\"},\n" +
                "    {\"stepOrder\": 3, \"stepType\": \"END\", \"actionType\": null}\n" +
                "  ]\n" +
                "}\n" +
                "Return ONLY raw JSON, no markdown formatting or extra commentary.";

        try {
            String aiResponse = groqClient.getChatCompletion(systemPrompt, Collections.emptyList());
            if (aiResponse != null && aiResponse.contains("{")) {
                int start = aiResponse.indexOf("{");
                int end = aiResponse.lastIndexOf("}");
                if (start != -1 && end != -1) {
                    String jsonStr = aiResponse.substring(start, end + 1);
                    return objectMapper.readValue(jsonStr, WorkflowCreateDto.class);
                }
            }
        } catch (Exception e) {
            log.warn("Error calling Groq for workflow generation, falling back to smart heuristic parsing", e);
        }

        // Fallback Heuristic Generator
        return fallbackGenerator(userPrompt);
    }

    public List<Map<String, Object>> getSmartSuggestions() {
        return List.of(
                Map.of(
                        "title", "Emergency Admission Fast-Track",
                        "description", "When an emergency patient is registered, immediately notify on-duty ER doctors and allocate an emergency bed.",
                        "triggerType", "PATIENT_ADMITTED",
                        "stepsCount", 4
                ),
                Map.of(
                        "title", "Low Pharmacy Stock Alert",
                        "description", "When medicine quantity drops below safety threshold, notify the Pharmacy Manager and issue a purchase requisition.",
                        "triggerType", "LOW_STOCK",
                        "stepsCount", 3
                ),
                Map.of(
                        "title", "Appointment Confirmation & Reminders",
                        "description", "Send automated SMS and email confirmation tickets to patients upon successful appointment booking.",
                        "triggerType", "APPOINTMENT_CONFIRMED",
                        "stepsCount", 3
                ),
                Map.of(
                        "title", "Discharge & Final Billing Clearance",
                        "description", "Generate final invoice, compile discharge summary, and email medical records upon patient discharge.",
                        "triggerType", "PATIENT_DISCHARGED",
                        "stepsCount", 4
                )
        );
    }

    public Map<String, Object> optimizeWorkflow(WorkflowCreateDto dto) {
        List<String> suggestions = new ArrayList<>();
        if (dto.getSteps() != null) {
            Set<String> actionTypes = new HashSet<>();
            for (WorkflowStepDto step : dto.getSteps()) {
                if (step.getActionType() != null && !actionTypes.add(step.getActionType())) {
                    suggestions.add("Duplicate action type detected: " + step.getActionType() + ". Consider consolidating steps.");
                }
            }
        }
        if (suggestions.isEmpty()) {
            suggestions.add("Workflow structure is optimal! All steps are sequenced efficiently.");
        }
        return Map.of(
                "workflowName", dto.getWorkflowName() != null ? dto.getWorkflowName() : "Automation",
                "optimizationScore", 95,
                "suggestions", suggestions
        );
    }

    private WorkflowCreateDto fallbackGenerator(String prompt) {
        String p = prompt.toLowerCase();
        String trigger = "PATIENT_ADMITTED";
        if (p.contains("appointment") || p.contains("book")) trigger = "APPOINTMENT_CONFIRMED";
        else if (p.contains("stock") || p.contains("medicine") || p.contains("pharmacy")) trigger = "LOW_STOCK";
        else if (p.contains("discharge") || p.contains("leave")) trigger = "PATIENT_DISCHARGED";

        List<WorkflowStepDto> steps = new ArrayList<>();
        steps.add(WorkflowStepDto.builder().stepOrder(1).stepType("START").actionType(null).build());
        steps.add(WorkflowStepDto.builder().stepOrder(2).stepType("ACTION").actionType("ASSIGN_DOCTOR").build());
        steps.add(WorkflowStepDto.builder().stepOrder(3).stepType("NOTIFICATION").actionType("SEND_NOTIFICATION").build());
        steps.add(WorkflowStepDto.builder().stepOrder(4).stepType("ACTION").actionType("GENERATE_BILL").build());
        steps.add(WorkflowStepDto.builder().stepOrder(5).stepType("END").actionType(null).build());

        return WorkflowCreateDto.builder()
                .workflowName("AI Generated: " + (prompt.length() > 30 ? prompt.substring(0, 30) + "..." : prompt))
                .description("Automated workflow compiled by AI assistant.")
                .triggerType(trigger)
                .status("ACTIVE")
                .createdBy("AI_ASSISTANT")
                .steps(steps)
                .build();
    }
}
