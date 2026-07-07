package codewithhimanshu.hospital.controller;

import codewithhimanshu.hospital.entity.DynamicForm;
import codewithhimanshu.hospital.entity.DynamicFormSubmission;
import codewithhimanshu.hospital.service.FormBuilderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
@Tag(name = "Dynamic Form Builder", description = "Endpoints for creating custom forms, rendering, submitting, and viewing reports")
public class FormBuilderController {

    private final FormBuilderService formBuilderService;

    @PostMapping("/create")
    @Operation(summary = "Create a new custom form template")
    public ResponseEntity<DynamicForm> createForm(@RequestBody DynamicForm form) {
        return ResponseEntity.ok(formBuilderService.createForm(form));
    }

    @PutMapping("/update/{id}")
    @Operation(summary = "Update an existing form template (archives and increments version if published)")
    public ResponseEntity<DynamicForm> updateForm(@PathVariable Long id, @RequestBody DynamicForm form) {
        return ResponseEntity.ok(formBuilderService.updateForm(id, form));
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Soft delete a custom form")
    public ResponseEntity<Map<String, String>> deleteForm(@PathVariable Long id) {
        formBuilderService.deleteForm(id);
        return ResponseEntity.ok(Map.of("message", "Form deleted successfully"));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all forms visible to the user's role and tenant")
    public ResponseEntity<List<DynamicForm>> getAllForms() {
        return ResponseEntity.ok(formBuilderService.getAllForms());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get form details by ID (accessible publicly if form is public and published)")
    public ResponseEntity<DynamicForm> getFormById(@PathVariable Long id) {
        return ResponseEntity.ok(formBuilderService.getFormById(id));
    }

    @PostMapping("/publish/{id}")
    @Operation(summary = "Publish a form, making it active")
    public ResponseEntity<DynamicForm> publishForm(@PathVariable Long id) {
        return ResponseEntity.ok(formBuilderService.publishForm(id));
    }

    @PostMapping("/clone/{id}")
    @Operation(summary = "Clone an existing form template")
    public ResponseEntity<DynamicForm> cloneForm(@PathVariable Long id) {
        return ResponseEntity.ok(formBuilderService.cloneForm(id));
    }

    @PostMapping("/submit/{id}")
    @Operation(summary = "Submit filled out form values (accessible publicly if form is public)")
    public ResponseEntity<DynamicFormSubmission> submitForm(@PathVariable Long id, @RequestBody Map<String, Object> values) {
        return ResponseEntity.ok(formBuilderService.submitForm(id, values));
    }

    @GetMapping("/submissions/{id}")
    @Operation(summary = "Get all submissions for a form")
    public ResponseEntity<List<DynamicFormSubmission>> getSubmissionsForForm(@PathVariable Long id) {
        return ResponseEntity.ok(formBuilderService.getSubmissionsForForm(id));
    }

    @PostMapping("/ai-generate")
    @Operation(summary = "AI-generate form fields structure based on prompt")
    public ResponseEntity<Map<String, Object>> generateFormWithAI(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Prompt is required"));
        }
        return ResponseEntity.ok(formBuilderService.generateFormWithAI(prompt));
    }
}
