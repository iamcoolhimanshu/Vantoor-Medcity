package codewithhimanshu.workflow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_execution_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowExecutionLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workflow_id", nullable = false)
    private Long workflowId;

    @Column(name = "workflow_name", length = 150)
    private String workflowName;

    @Column(name = "entity_id", length = 100)
    private String entityId;

    @Column(name = "entity_type", length = 100)
    private String entityType;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // SUCCESS, FAILED, IN_PROGRESS, RETRIED

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    @PrePersist
    public void onCreate() {
        this.executedAt = LocalDateTime.now();
    }
}
