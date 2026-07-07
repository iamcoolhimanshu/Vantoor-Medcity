package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.HospitalInvoiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalInvoiceRepository extends JpaRepository<HospitalInvoiceEntity, Long> {
	List<HospitalInvoiceEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<HospitalInvoiceEntity> findByPatientIdAndAccountIdAndIsDeletedFalse(Long patientId, Long accountId);

	List<HospitalInvoiceEntity> findByAdmissionIdAndIsDeletedFalse(Long admissionId);

	Optional<HospitalInvoiceEntity> findByInvoiceNumberAndIsDeletedFalse(String invoiceNumber);

	List<HospitalInvoiceEntity> findByPaymentStatusAndAccountId(String status, Long accountId);

	@Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM HospitalInvoiceEntity i WHERE i.accountId = :accountId AND i.isDeleted = false AND i.invoiceStatus = 'PAID'")
	BigDecimal sumTotalRevenue(@Param("accountId") Long accountId);

	@Query("SELECT COALESCE(SUM(i.pendingAmount), 0) FROM HospitalInvoiceEntity i WHERE i.accountId = :accountId AND i.isDeleted = false AND i.paymentStatus != 'PAID'")
	BigDecimal sumPendingAmount(@Param("accountId") Long accountId);
}