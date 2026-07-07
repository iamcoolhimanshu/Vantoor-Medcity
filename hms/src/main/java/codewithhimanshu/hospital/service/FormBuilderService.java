package codewithhimanshu.hospital.service;

import codewithhimanshu.ai.service.GroqClient;
import codewithhimanshu.hospital.entity.DynamicForm;
import codewithhimanshu.hospital.entity.DynamicFormField;
import codewithhimanshu.hospital.entity.DynamicFormSubmission;
import codewithhimanshu.hospital.repository.DynamicFormFieldRepository;
import codewithhimanshu.hospital.repository.DynamicFormRepository;
import codewithhimanshu.hospital.repository.DynamicFormSubmissionRepository;
import codewithhimanshu.workflow.service.WorkflowEngineService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FormBuilderService {

    private final DynamicFormRepository formRepo;
    private final DynamicFormFieldRepository fieldRepo;
    private final DynamicFormSubmissionRepository submissionRepo;
    private final AppUserService appUserService;
    private final WorkflowEngineService workflowEngineService;
    private final GroqClient groqClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$");

    private Long getAccountId() {
        try {
            return appUserService.getLoggedInUserAccountId();
        } catch (Exception e) {
            return null; // Public / anonymous users won't have accountId
        }
    }

    private String getUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return "anonymous";
    }

    private Long getUserId() {
        try {
            return appUserService.getLoggedInUserId();
        } catch (Exception e) {
            return null;
        }
    }

    // ── CRUD OPERATIONS ──

    @Transactional
    public DynamicForm createForm(DynamicForm form) {
        Long accountId = getAccountId();
        form.setAccountId(accountId);
        form.setCreatedBy(getUserId());
        form.setCreatedByUsername(getUsername());
        form.setIsActive(true);
        form.setIsDeleted(false);
        form.setStatus(form.getStatus() != null ? form.getStatus() : "DRAFT");
        form.setVersion(1);

        if (form.getFields() != null) {
            for (int i = 0; i < form.getFields().size(); i++) {
                DynamicFormField field = form.getFields().get(i);
                field.setForm(form);
                if (field.getDisplayOrder() == null) {
                    field.setDisplayOrder(i + 1);
                }
            }
        }

        return formRepo.save(form);
    }

    @Transactional
    public DynamicForm updateForm(Long id, DynamicForm updated) {
        DynamicForm existing = formRepo.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Form not found"));

        // Tenant verification (unless Super Admin)
        Long tenantId = getAccountId();
        if (tenantId != null && !tenantId.equals(existing.getAccountId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this form");
        }

        // Version control: if already PUBLISHED, archive the current state as a snapshot and increment version
        if ("PUBLISHED".equalsIgnoreCase(existing.getStatus())) {
            log.info("Form ID {} is published. Archiving current version {} and creating a new active version.", id, existing.getVersion());
            
            // Create Archived Snapshot
            DynamicForm archiveCopy = DynamicForm.builder()
                    .formName(existing.getFormName() + " (V" + existing.getVersion() + ")")
                    .description(existing.getDescription())
                    .status("ARCHIVED")
                    .version(existing.getVersion())
                    .roleBasedAccess(existing.getRoleBasedAccess())
                    .workflowIntegration(existing.getWorkflowIntegration())
                    .publicAccess(existing.getPublicAccess())
                    .createdByUsername(existing.getCreatedByUsername())
                    .build();
            archiveCopy.setAccountId(existing.getAccountId());
            archiveCopy.setCreatedBy(existing.getCreatedBy());
            archiveCopy.setIsDeleted(false);
            archiveCopy.setIsActive(false);

            List<DynamicFormField> archivedFields = new ArrayList<>();
            for (DynamicFormField f : existing.getFields()) {
                archivedFields.add(DynamicFormField.builder()
                        .form(archiveCopy)
                        .fieldName(f.getFieldName())
                        .fieldLabel(f.getFieldLabel())
                        .fieldType(f.getFieldType())
                        .required(f.isRequired())
                        .validationJson(f.getValidationJson())
                        .optionsJson(f.getOptionsJson())
                        .displayOrder(f.getDisplayOrder())
                        .conditionalJson(f.getConditionalJson())
                        .build());
            }
            archiveCopy.setFields(archivedFields);
            formRepo.save(archiveCopy);

            // Increment version on the current main form
            existing.setVersion(existing.getVersion() + 1);
        }

        // Update the main form
        existing.setFormName(updated.getFormName());
        existing.setDescription(updated.getDescription());
        existing.setStatus(updated.getStatus() != null ? updated.getStatus() : "DRAFT");
        existing.setRoleBasedAccess(updated.getRoleBasedAccess());
        existing.setWorkflowIntegration(updated.getWorkflowIntegration());
        existing.setPublicAccess(updated.getPublicAccess());
        existing.setUpdatedBy(getUserId());

        // Replace/merge fields
        existing.getFields().clear();
        if (updated.getFields() != null) {
            for (int i = 0; i < updated.getFields().size(); i++) {
                DynamicFormField field = updated.getFields().get(i);
                field.setForm(existing);
                if (field.getDisplayOrder() == null) {
                    field.setDisplayOrder(i + 1);
                }
                existing.getFields().add(field);
            }
        }

        return formRepo.save(existing);
    }

    @Transactional
    public void deleteForm(Long id) {
        DynamicForm form = formRepo.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Form not found"));

        Long tenantId = getAccountId();
        if (tenantId != null && !tenantId.equals(form.getAccountId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to delete this form");
        }

        form.setIsDeleted(true);
        formRepo.save(form);
    }

    @Transactional(readOnly = true)
    public List<DynamicForm> getAllForms() {
        Long tenantId = getAccountId();
        if (tenantId == null && appUserService.isAdmin()) {
            return formRepo.findByStatusAndIsDeletedFalse("PUBLISHED"); // default for generic/public view, or admin retrieves all
        }
        
        // If super admin requests, list everything
        if (appUserService.isAdmin()) {
            return formRepo.findAll().stream().filter(f -> !Boolean.TRUE.equals(f.getIsDeleted())).collect(Collectors.toList());
        }

        // Return forms scoped to the user's tenant account
        return formRepo.findByAccountIdAndIsDeletedFalse(tenantId);
    }

    @Transactional(readOnly = true)
    public DynamicForm getFormById(Long id) {
        DynamicForm form = formRepo.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Form not found"));

        // If form is PUBLIC and PUBLISHED, let anyone read it (even anonymous patients)
        if (Boolean.TRUE.equals(form.getPublicAccess()) && "PUBLISHED".equalsIgnoreCase(form.getStatus())) {
            return form;
        }

        // Otherwise check JWT user tenancy
        Long tenantId = getAccountId();
        if (tenantId != null && !tenantId.equals(form.getAccountId()) && !appUserService.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this form");
        }

        return form;
    }

    @Transactional
    public DynamicForm publishForm(Long id) {
        DynamicForm form = formRepo.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Form not found"));

        Long tenantId = getAccountId();
        if (tenantId != null && !tenantId.equals(form.getAccountId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to publish this form");
        }

        form.setStatus("PUBLISHED");
        form.setUpdatedBy(getUserId());
        return formRepo.save(form);
    }

    @Transactional
    public DynamicForm cloneForm(Long id) {
        DynamicForm existing = formRepo.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Form to clone not found"));

        Long tenantId = getAccountId();
        if (tenantId != null && !tenantId.equals(existing.getAccountId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to clone this form");
        }

        DynamicForm cloned = DynamicForm.builder()
                .formName(existing.getFormName() + " (Clone)")
                .description(existing.getDescription())
                .status("DRAFT")
                .version(1)
                .roleBasedAccess(existing.getRoleBasedAccess())
                .workflowIntegration(existing.getWorkflowIntegration())
                .publicAccess(existing.getPublicAccess())
                .createdByUsername(getUsername())
                .build();
        cloned.setAccountId(existing.getAccountId());
        cloned.setCreatedBy(getUserId());
        cloned.setIsDeleted(false);
        cloned.setIsActive(true);

        List<DynamicFormField> clonedFields = new ArrayList<>();
        for (DynamicFormField f : existing.getFields()) {
            clonedFields.add(DynamicFormField.builder()
                    .form(cloned)
                    .fieldName(f.getFieldName())
                    .fieldLabel(f.getFieldLabel())
                    .fieldType(f.getFieldType())
                    .required(f.isRequired())
                    .validationJson(f.getValidationJson())
                    .optionsJson(f.getOptionsJson())
                    .displayOrder(f.getDisplayOrder())
                    .conditionalJson(f.getConditionalJson())
                    .build());
        }
        cloned.setFields(clonedFields);

        return formRepo.save(cloned);
    }

    // ── FORM SUBMISSIONS & VALIDATION ──

    @Transactional
    public DynamicFormSubmission submitForm(Long formId, Map<String, Object> values) {
        DynamicForm form = formRepo.findByIdAndIsDeletedFalse(formId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Form not found"));

        if (!"PUBLISHED".equalsIgnoreCase(form.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Form is not published. Submissions are disabled.");
        }

        // Validate values against form fields
        Map<String, String> errors = validateSubmission(form, values);
        if (!errors.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Validation failed: " + errors);
        }

        String jsonValues;
        try {
            jsonValues = objectMapper.writeValueAsString(values);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to serialize submission values");
        }

        DynamicFormSubmission submission = DynamicFormSubmission.builder()
                .form(form)
                .submittedBy(getUsername())
                .submissionJson(jsonValues)
                .build();
        
        submission.setAccountId(form.getAccountId());
        submission.setCreatedBy(getUserId());
        submission.setIsDeleted(false);
        submission.setIsActive(true);

        DynamicFormSubmission saved = submissionRepo.save(submission);

        // Workflow Engine Trigger
        if (form.getWorkflowIntegration() != null && !form.getWorkflowIntegration().trim().isEmpty()) {
            try {
                log.info("Triggering workflow for form submission: {} (Trigger: {})", form.getFormName(), form.getWorkflowIntegration());
                Map<String, Object> payload = new HashMap<>(values);
                payload.put("formName", form.getFormName());
                payload.put("submittedBy", submission.getSubmittedBy());
                payload.put("submissionId", saved.getId());
                
                workflowEngineService.executeWorkflowsForTrigger(
                        form.getWorkflowIntegration(),
                        saved.getId().toString(),
                        "DYNAMIC_FORM_SUBMISSION",
                        payload
                );
            } catch (Exception e) {
                log.error("Failed to trigger workflow context for submission ID {}", saved.getId(), e);
            }
        }

        return saved;
    }

    private Map<String, String> validateSubmission(DynamicForm form, Map<String, Object> values) {
        Map<String, String> errors = new HashMap<>();

        for (DynamicFormField field : form.getFields()) {
            String name = field.getFieldName();
            Object rawValue = values.get(name);
            String val = rawValue != null ? String.valueOf(rawValue).trim() : "";

            // Check required fields
            if (field.isRequired() && val.isEmpty()) {
                errors.put(name, field.getFieldLabel() + " is required.");
                continue;
            }

            // Skip further validations if empty
            if (val.isEmpty()) {
                continue;
            }

            // Validate based on validations JSON properties
            String valJson = field.getValidationJson();
            if (valJson != null && !valJson.trim().isEmpty()) {
                try {
                    Map<String, Object> rules = objectMapper.readValue(valJson, new TypeReference<Map<String, Object>>() {});
                    
                    // Min/Max Length (for text fields)
                    if (rules.containsKey("minLength")) {
                        int minLen = Integer.parseInt(String.valueOf(rules.get("minLength")));
                        if (val.length() < minLen) {
                            errors.put(name, field.getFieldLabel() + " must be at least " + minLen + " characters.");
                        }
                    }
                    if (rules.containsKey("maxLength")) {
                        int maxLen = Integer.parseInt(String.valueOf(rules.get("maxLength")));
                        if (val.length() > maxLen) {
                            errors.put(name, field.getFieldLabel() + " must not exceed " + maxLen + " characters.");
                        }
                    }

                    // Min/Max value (for numbers)
                    if ("NUMBER".equalsIgnoreCase(field.getFieldType())) {
                        try {
                            double numVal = Double.parseDouble(val);
                            if (rules.containsKey("minValue")) {
                                double minVal = Double.parseDouble(String.valueOf(rules.get("minValue")));
                                if (numVal < minVal) {
                                    errors.put(name, field.getFieldLabel() + " must be at least " + minVal + ".");
                                }
                            }
                            if (rules.containsKey("maxValue")) {
                                double maxVal = Double.parseDouble(String.valueOf(rules.get("maxValue")));
                                if (numVal > maxVal) {
                                    errors.put(name, field.getFieldLabel() + " must not exceed " + maxVal + ".");
                                }
                            }
                        } catch (NumberFormatException e) {
                            errors.put(name, field.getFieldLabel() + " must be a valid number.");
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse validations JSON for field: " + name, e);
                }
            }

            // Standard field type validations
            if ("EMAIL".equalsIgnoreCase(field.getFieldType())) {
                if (!EMAIL_PATTERN.matcher(val).matches()) {
                    errors.put(name, "Please enter a valid email address.");
                }
            }
        }

        return errors;
    }

    @Transactional(readOnly = true)
    public List<DynamicFormSubmission> getSubmissionsForForm(Long formId) {
        DynamicForm form = formRepo.findByIdAndIsDeletedFalse(formId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Form not found"));

        Long tenantId = getAccountId();
        if (tenantId != null && !tenantId.equals(form.getAccountId()) && !appUserService.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to submissions");
        }

        if (appUserService.isAdmin()) {
            return submissionRepo.findByFormIdAndIsDeletedFalseOrderByCreatedAtDesc(formId);
        } else {
            return submissionRepo.findByFormIdAndAccountIdAndIsDeletedFalseOrderByCreatedAtDesc(formId, tenantId);
        }
    }

    // ── AI FORM GENERATOR ──

    public Map<String, Object> generateFormWithAI(String prompt) {
        String systemPrompt = "You are a hospital management AI assistant. " +
                "Generate a dynamic form representation in JSON format for the topic requested by the admin. " +
                "Supported fieldTypes are: TEXT, TEXTAREA, NUMBER, EMAIL, PHONE, DATE, TIME, DATETIME, DROPDOWN, MULTISELECT, CHECKBOX, RADIO, FILE_UPLOAD, IMAGE_UPLOAD, SIGNATURE_PAD, RICH_TEXT_EDITOR, PASSWORD, SWITCH, RATING, SECTION_HEADER, DIVIDER, AI_GENERATED. " +
                "You must strictly output a valid JSON object matching this schema. Do not add markdown backticks or commentary.\n" +
                "Schema format:\n" +
                "{\n" +
                "  \"formName\": \"Blood Donation Form\",\n" +
                "  \"description\": \"For donor collection screening\",\n" +
                "  \"fields\": [\n" +
                "    {\n" +
                "      \"fieldName\": \"donorName\",\n" +
                "      \"fieldLabel\": \"Donor Name\",\n" +
                "      \"fieldType\": \"TEXT\",\n" +
                "      \"required\": true,\n" +
                "      \"displayOrder\": 1,\n" +
                "      \"validationJson\": \"{\\\"minLength\\\":2, \\\"maxLength\\\":100}\",\n" +
                "      \"optionsJson\": null,\n" +
                "      \"conditionalJson\": null\n" +
                "    },\n" +
                "    {\n" +
                "      \"fieldName\": \"bloodGroup\",\n" +
                "      \"fieldLabel\": \"Blood Group\",\n" +
                "      \"fieldType\": \"DROPDOWN\",\n" +
                "      \"required\": true,\n" +
                "      \"displayOrder\": 2,\n" +
                "      \"validationJson\": null,\n" +
                "      \"optionsJson\": \"[\\\"A+\\\", \\\"A-\\\", \\\"B+\\\", \\\"B-\\\", \\\"AB+\\\", \\\"AB-\\\", \\\"O+\\\", \\\"O-\\\"]\",\n" +
                "      \"conditionalJson\": null\n" +
                "    }\n" +
                "  ]\n" +
                "}";

        log.info("Sending AI form request with prompt: {}", prompt);
        String aiResponse = groqClient.getChatCompletion(systemPrompt, prompt);

        // Sanitize output (sometimes models wrap output in ```json ... ```)
        if (aiResponse.contains("```json")) {
            int start = aiResponse.indexOf("```json") + 7;
            int end = aiResponse.indexOf("```", start);
            if (end > start) {
                aiResponse = aiResponse.substring(start, end).trim();
            }
        } else if (aiResponse.contains("```")) {
            int start = aiResponse.indexOf("```") + 3;
            int end = aiResponse.indexOf("```", start);
            if (end > start) {
                aiResponse = aiResponse.substring(start, end).trim();
            }
        }

        try {
            return objectMapper.readValue(aiResponse, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("AI form response JSON parsing failed: {}", aiResponse, e);
            // Return a fallback basic structure so it doesn't error out
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("formName", "AI Generated Form");
            fallback.put("description", "Auto-generated template for " + prompt);
            
            List<Map<String, Object>> fields = new ArrayList<>();
            Map<String, Object> nameField = new HashMap<>();
            nameField.put("fieldName", "fullName");
            nameField.put("fieldLabel", "Full Name");
            nameField.put("fieldType", "TEXT");
            nameField.put("required", true);
            nameField.put("displayOrder", 1);
            fields.add(nameField);

            Map<String, Object> dateField = new HashMap<>();
            dateField.put("fieldName", "date");
            dateField.put("fieldLabel", "Date");
            dateField.put("fieldType", "DATE");
            dateField.put("required", true);
            dateField.put("displayOrder", 2);
            fields.add(dateField);

            fallback.put("fields", fields);
            return fallback;
        }
    }
}
