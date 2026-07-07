package codewithhimanshu.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import codewithhimanshu.hospital.entity.BedEntity;

import java.util.List;

@Repository
public interface BedRepository extends JpaRepository<BedEntity, Long> {
	List<BedEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<BedEntity> findByWardIdAndAccountIdAndIsDeletedFalse(Long wardId, Long accountId);

	List<BedEntity> findByHospitalIdAndAccountIdAndIsDeletedFalse(Long hospitalId, Long accountId);

	List<BedEntity> findByBedStatusAndHospitalIdAndAccountId(String status, Long hospitalId, Long accountId);

	boolean existsByBedNumberAndWardIdAndAccountId(String bedNum, Long wardId, Long accountId);

	long countByHospitalIdAndBedStatus(Long hospitalId, String status);

	long countByWardIdAndBedStatusAndIsDeletedFalse(Long wardId, String status);

	long countByWardIdAndIsDeletedFalse(Long wardId);
}