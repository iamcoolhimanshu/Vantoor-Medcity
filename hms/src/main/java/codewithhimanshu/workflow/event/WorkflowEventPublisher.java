package codewithhimanshu.workflow.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkflowEventPublisher {

    private final ApplicationEventPublisher eventPublisher;

    public void publishEvent(String triggerType, String entityId, String entityType, Map<String, Object> payload) {
        log.info("Publishing domain event trigger: {} for entity: {} ({})", triggerType, entityId, entityType);
        HospitalDomainEvent event = new HospitalDomainEvent(this, triggerType, entityId, entityType, payload);
        eventPublisher.publishEvent(event);
    }
}
