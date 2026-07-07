package codewithhimanshu.workflow.repository;

import codewithhimanshu.workflow.entity.WorkflowStepsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowStepsRepository extends JpaRepository<WorkflowStepsEntity, Long> {
    List<WorkflowStepsEntity> findByWorkflowIdOrderByStepOrderAsc(Long workflowId);
    void deleteByWorkflowId(Long workflowId);
}
