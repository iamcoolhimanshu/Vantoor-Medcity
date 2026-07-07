package codewithhimanshu.workflow.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.Map;

@Getter
public class HospitalDomainEvent extends ApplicationEvent {
    private final String triggerType;
    private final String entityId;
    private final String entityType;
    private final Map<String, Object> payload;

    public HospitalDomainEvent(Object source, String triggerType, String entityId, String entityType, Map<String, Object> payload) {
        super(source);
        this.triggerType = triggerType;
        this.entityId = entityId;
        this.entityType = entityType;
        this.payload = payload;
    }
}
