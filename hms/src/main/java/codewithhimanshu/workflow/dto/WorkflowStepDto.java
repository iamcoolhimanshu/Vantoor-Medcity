package codewithhimanshu.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowStepDto {
    private Long id;
    private Integer stepOrder;
    private String stepType; // START, CONDITION, ACTION, EMAIL, SMS, NOTIFICATION, AI_ACTION, END
    private String actionType; // ASSIGN_DOCTOR, GENERATE_BILL, SEND_EMAIL, etc.
    private String conditionJson;
    private String actionJson;
}
