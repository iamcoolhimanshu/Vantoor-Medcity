package codewithhimanshu.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import codewithhimanshu.hospital.entity.AdvancePaymentEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdvancePaymentRepository extends JpaRepository<AdvancePaymentEntity, Long> {

	List<AdvancePaymentEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<AdvancePaymentEntity> findByPatientIdAndAccountIdAndIsDeletedFalse(Long patientId, Long accountId);

	List<AdvancePaymentEntity> findByAdmissionIdAndIsDeletedFalse(Long admissionId);

	List<AdvancePaymentEntity> findByAdvanceStatusAndAccountIdAndIsDeletedFalse(String status, Long accountId);

	Optional<AdvancePaymentEntity> findByAdvanceReferenceAndIsDeletedFalse(String reference);

	@Query("SELECT COALESCE(SUM(a.balanceAmount), 0) FROM AdvancePaymentEntity a "
			+ "WHERE a.patientId = :patientId AND a.admissionId = :admissionId "
			+ "AND a.advanceStatus NOT IN ('REFUNDED','ADJUSTED') AND a.isDeleted = false")
	BigDecimal sumAvailableAdvanceBalance(@Param("patientId") Long patientId, @Param("admissionId") Long admissionId);
}