package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.HospitalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<HospitalEntity, Long> {
	List<HospitalEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<HospitalEntity> findByIsDeletedFalse();

	Optional<HospitalEntity> findByRegistrationNumberAndIsDeletedFalse(String registrationNumber);

	boolean existsByRegistrationNumberAndAccountId(String regNum, Long accountId);
}