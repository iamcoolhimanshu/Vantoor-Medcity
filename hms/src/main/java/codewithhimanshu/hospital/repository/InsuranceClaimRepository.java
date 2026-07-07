package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.InsuranceClaimEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaimEntity, Long> {

	List<InsuranceClaimEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<InsuranceClaimEntity> findByPatientIdAndAccountIdAndIsDeletedFalse(Long patientId, Long accountId);

	List<InsuranceClaimEntity> findByAdmissionIdAndIsDeletedFalse(Long admissionId);

	List<InsuranceClaimEntity> findByClaimStatusAndAccountIdAndIsDeletedFalse(String status, Long accountId);

	Optional<InsuranceClaimEntity> findByClaimNumberAndIsDeletedFalse(String claimNumber);

	@Query("SELECT COALESCE(SUM(c.approvedAmount), 0) FROM InsuranceClaimEntity c WHERE c.accountId = :accountId AND c.claimStatus = 'SETTLED' AND c.isDeleted = false")
	BigDecimal sumSettledClaims(@Param("accountId") Long accountId);

	List<InsuranceClaimEntity> findByInvoiceIdAndIsDeletedFalse(Long invoiceId);
}
