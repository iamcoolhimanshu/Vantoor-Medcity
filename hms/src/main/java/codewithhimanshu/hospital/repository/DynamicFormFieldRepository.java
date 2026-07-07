package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.DynamicFormField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DynamicFormFieldRepository extends JpaRepository<DynamicFormField, Long> {
}
