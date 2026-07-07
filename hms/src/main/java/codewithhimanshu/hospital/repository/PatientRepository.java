package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<PatientEntity, Long> {
	List<PatientEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	Optional<PatientEntity> findByMobileNumberAndIsDeletedFalse(String mobile);

	Optional<PatientEntity> findByUhidAndIsDeletedFalse(String uhid);

	boolean existsByMobileNumberAndAccountId(String mobile, Long accountId);

	List<PatientEntity> findByPatientNameContainingIgnoreCaseAndAccountId(String name, Long accountId);
}