package codewithhimanshu.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowExecuteRequestDto {
    private Long workflowId;
    private String triggerType;
    private String entityId;
    private String entityType;
    private Map<String, Object> payload;
}
