package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.InvoiceItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItemEntity, Long> {

    List<InvoiceItemEntity> findByInvoiceIdAndIsDeletedFalse(Long invoiceId);

    List<InvoiceItemEntity> findByInvoiceIdAndItemCategoryAndIsDeletedFalse(Long invoiceId, String category);

    void deleteByInvoiceId(Long invoiceId);

    @Query("SELECT COALESCE(SUM(i.netAmount), 0) FROM InvoiceItemEntity i " +
           "WHERE i.invoiceId = :invoiceId AND i.isDeleted = false")
    BigDecimal sumNetAmountByInvoice(@Param("invoiceId") Long invoiceId);
}
