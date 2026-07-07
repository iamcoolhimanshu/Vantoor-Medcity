package codewithhimanshu.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowCreateDto {
    private Long id;
    private String workflowName;
    private String description;
    private String triggerType;
    private String status;
    private String createdBy;
    private List<WorkflowStepDto> steps;
}
