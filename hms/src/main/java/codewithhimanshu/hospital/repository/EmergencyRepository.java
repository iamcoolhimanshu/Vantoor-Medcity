package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.EmergencyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmergencyRepository extends JpaRepository<EmergencyEntity, Long> {
	List<EmergencyEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<EmergencyEntity> findByHospitalIdAndAccountIdAndIsDeletedFalse(Long hospitalId, Long accountId);

	List<EmergencyEntity> findByEmergencyStatusAndAccountId(String status, Long accountId);
}