package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.DynamicForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DynamicFormRepository extends JpaRepository<DynamicForm, Long> {
    List<DynamicForm> findByAccountIdAndIsDeletedFalse(Long accountId);
    
    Optional<DynamicForm> findByIdAndIsDeletedFalse(Long id);

    List<DynamicForm> findByStatusAndIsDeletedFalse(String status);
}
