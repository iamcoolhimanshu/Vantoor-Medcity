package codewithhimanshu.workflow.service;

import codewithhimanshu.workflow.event.HospitalDomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkflowEventListener {

    private final WorkflowEngineService workflowEngineService;

    @EventListener
    public void handleHospitalEvent(HospitalDomainEvent event) {
        log.info("Received domain event via Spring Event Bus: {}", event.getTriggerType());
        workflowEngineService.executeWorkflowsForTrigger(
                event.getTriggerType(),
                event.getEntityId(),
                event.getEntityType(),
                event.getPayload()
        );
    }
}
