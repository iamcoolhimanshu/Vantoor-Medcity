package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.RefundEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRepository extends JpaRepository<RefundEntity, Long> {

    List<RefundEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

    List<RefundEntity> findByPatientIdAndAccountIdAndIsDeletedFalse(Long patientId, Long accountId);

    List<RefundEntity> findByInvoiceIdAndIsDeletedFalse(Long invoiceId);

    List<RefundEntity> findByRefundStatusAndAccountIdAndIsDeletedFalse(String status, Long accountId);

    Optional<RefundEntity> findByRefundReferenceAndIsDeletedFalse(String reference);

    @Query("SELECT COALESCE(SUM(r.refundAmount), 0) FROM RefundEntity r " +
           "WHERE r.accountId = :accountId AND r.refundStatus = 'PROCESSED' AND r.isDeleted = false")
    BigDecimal sumProcessedRefunds(@Param("accountId") Long accountId);
}
