package codewithhimanshu.workflow.repository;

import codewithhimanshu.workflow.entity.WorkflowExecutionLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowExecutionLogRepository extends JpaRepository<WorkflowExecutionLogEntity, Long> {
    List<WorkflowExecutionLogEntity> findTop50ByOrderByExecutedAtDesc();
    List<WorkflowExecutionLogEntity> findByWorkflowIdOrderByExecutedAtDesc(Long workflowId);
}
