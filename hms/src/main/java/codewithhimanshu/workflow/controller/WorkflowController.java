package codewithhimanshu.workflow.controller;

import codewithhimanshu.workflow.dto.AIWorkflowGenerateRequestDto;
import codewithhimanshu.workflow.dto.WorkflowCreateDto;
import codewithhimanshu.workflow.dto.WorkflowExecuteRequestDto;
import codewithhimanshu.workflow.entity.WorkflowExecutionLogEntity;
import codewithhimanshu.workflow.entity.WorkflowMasterEntity;
import codewithhimanshu.workflow.service.AIWorkflowService;
import codewithhimanshu.workflow.service.WorkflowEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workflow")
@CrossOrigin("*")
@RequiredArgsConstructor
@Tag(name = "Smart Workflow & Automation Engine")
public class WorkflowController {

    private final WorkflowEngineService workflowEngineService;
    private final AIWorkflowService aiWorkflowService;

    @PostMapping("/create")
    @Operation(summary = "Create a new hospital workflow")
    public ResponseEntity<WorkflowMasterEntity> createWorkflow(@RequestBody WorkflowCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workflowEngineService.createWorkflow(dto));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all hospital workflows")
    public ResponseEntity<List<WorkflowCreateDto>> getAllWorkflows() {
        return ResponseEntity.ok(workflowEngineService.getAllWorkflows());
    }

    @GetMapping("/{id:\\d+}")
    @Operation(summary = "Get workflow by ID")
    public ResponseEntity<WorkflowCreateDto> getWorkflowById(@PathVariable Long id) {
        return ResponseEntity.ok(workflowEngineService.getWorkflowById(id));
    }

    @PostMapping("/execute")
    @Operation(summary = "Manually trigger or execute a workflow")
    public ResponseEntity<WorkflowExecutionLogEntity> executeWorkflow(@RequestBody WorkflowExecuteRequestDto request) {
        WorkflowCreateDto workflowDto = workflowEngineService.getWorkflowById(request.getWorkflowId());
        WorkflowMasterEntity master = WorkflowMasterEntity.builder()
                .id(workflowDto.getId())
                .workflowName(workflowDto.getWorkflowName())
                .triggerType(workflowDto.getTriggerType())
                .status(workflowDto.getStatus())
                .build();

        WorkflowExecutionLogEntity logResult = workflowEngineService.executeSingleWorkflow(
                master,
                request.getEntityId() != null ? request.getEntityId() : "MANUAL",
                request.getEntityType() != null ? request.getEntityType() : "TEST",
                request.getPayload() != null ? request.getPayload() : Map.of()
        );
        return ResponseEntity.ok(logResult);
    }

    @PostMapping("/activate")
    @Operation(summary = "Activate a workflow by ID")
    public ResponseEntity<WorkflowMasterEntity> activateWorkflowParam(@RequestParam Long id) {
        return ResponseEntity.ok(workflowEngineService.activateWorkflow(id));
    }

    @PostMapping("/activate/{id:\\d+}")
    @Operation(summary = "Activate a workflow by path variable")
    public ResponseEntity<WorkflowMasterEntity> activateWorkflowPath(@PathVariable Long id) {
        return ResponseEntity.ok(workflowEngineService.activateWorkflow(id));
    }

    @PostMapping("/deactivate")
    @Operation(summary = "Deactivate a workflow by ID")
    public ResponseEntity<WorkflowMasterEntity> deactivateWorkflowParam(@RequestParam Long id) {
        return ResponseEntity.ok(workflowEngineService.deactivateWorkflow(id));
    }

    @PostMapping("/deactivate/{id:\\d+}")
    @Operation(summary = "Deactivate a workflow by path variable")
    public ResponseEntity<WorkflowMasterEntity> deactivateWorkflowPath(@PathVariable Long id) {
        return ResponseEntity.ok(workflowEngineService.deactivateWorkflow(id));
    }

    @DeleteMapping("/delete")
    @Operation(summary = "Delete a workflow by ID parameter")
    public ResponseEntity<Map<String, String>> deleteWorkflowParam(@RequestParam Long id) {
        workflowEngineService.deleteWorkflow(id);
        return ResponseEntity.ok(Map.of("message", "Workflow deleted successfully"));
    }

    @DeleteMapping("/delete/{id:\\d+}")
    @Operation(summary = "Delete a workflow by path variable")
    public ResponseEntity<Map<String, String>> deleteWorkflowPath(@PathVariable Long id) {
        workflowEngineService.deleteWorkflow(id);
        return ResponseEntity.ok(Map.of("message", "Workflow deleted successfully"));
    }

    @GetMapping("/logs")
    @Operation(summary = "Get recent workflow execution logs")
    public ResponseEntity<List<WorkflowExecutionLogEntity>> getExecutionLogs() {
        return ResponseEntity.ok(workflowEngineService.getRecentExecutionLogs());
    }

    @GetMapping("/stats")
    @Operation(summary = "Get dynamic workflow KPI engine metrics")
    public ResponseEntity<Map<String, Object>> getWorkflowStats() {
        return ResponseEntity.ok(workflowEngineService.getWorkflowStats());
    }

    // ── AI AUTOMATION ENDPOINTS ──

    @PostMapping("/ai/generate")
    @Operation(summary = "AI Workflow Generator: Convert natural language prompt into workflow JSON")
    public ResponseEntity<WorkflowCreateDto> generateWorkflowFromPrompt(@RequestBody AIWorkflowGenerateRequestDto request) {
        return ResponseEntity.ok(aiWorkflowService.generateWorkflowFromPrompt(request.getPrompt()));
    }

    @GetMapping("/ai/suggestions")
    @Operation(summary = "AI Smart Suggestions: Get recommended hospital automation workflows")
    public ResponseEntity<List<Map<String, Object>>> getSmartSuggestions() {
        return ResponseEntity.ok(aiWorkflowService.getSmartSuggestions());
    }

    @PostMapping("/ai/optimize")
    @Operation(summary = "AI Workflow Optimizer: Analyze workflow for redundant actions and performance")
    public ResponseEntity<Map<String, Object>> optimizeWorkflow(@RequestBody WorkflowCreateDto dto) {
        return ResponseEntity.ok(aiWorkflowService.optimizeWorkflow(dto));
    }
}
