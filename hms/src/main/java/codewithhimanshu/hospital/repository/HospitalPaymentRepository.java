package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.HospitalPaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HospitalPaymentRepository extends JpaRepository<HospitalPaymentEntity, Long> {
	List<HospitalPaymentEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<HospitalPaymentEntity> findByInvoiceIdAndIsDeletedFalse(Long invoiceId);

	List<HospitalPaymentEntity> findByPatientIdAndAccountIdAndIsDeletedFalse(Long patientId, Long accountId);
}