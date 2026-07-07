package codewithhimanshu.workflow.repository;

import codewithhimanshu.workflow.entity.WorkflowMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowMasterRepository extends JpaRepository<WorkflowMasterEntity, Long> {
    List<WorkflowMasterEntity> findByTriggerTypeAndStatus(String triggerType, String status);
    List<WorkflowMasterEntity> findByStatus(String status);
}
