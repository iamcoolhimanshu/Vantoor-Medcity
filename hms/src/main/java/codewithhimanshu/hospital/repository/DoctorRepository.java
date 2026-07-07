package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.DoctorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<DoctorEntity, Long> {
	List<DoctorEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<DoctorEntity> findByHospitalIdAndAccountIdAndIsDeletedFalse(Long hospitalId, Long accountId);

	List<DoctorEntity> findBySpecializationContainingIgnoreCaseAndAccountIdAndIsDeletedFalse(String spec,
			Long accountId);

	Optional<DoctorEntity> findByMobileNumberAndIsDeletedFalse(String mobile);

	boolean existsByMobileNumberAndAccountId(String mobile, Long accountId);

	List<DoctorEntity> findByStatusAndAccountIdAndIsDeletedFalse(String status, Long accountId);

	long countByHospitalIdAndIsDeletedFalse(Long hospitalId);
}