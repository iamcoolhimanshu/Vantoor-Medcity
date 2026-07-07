package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.DynamicFormSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DynamicFormSubmissionRepository extends JpaRepository<DynamicFormSubmission, Long> {
    List<DynamicFormSubmission> findByFormIdAndIsDeletedFalseOrderByCreatedAtDesc(Long formId);

    List<DynamicFormSubmission> findByFormIdAndAccountIdAndIsDeletedFalseOrderByCreatedAtDesc(Long formId, Long accountId);
}
