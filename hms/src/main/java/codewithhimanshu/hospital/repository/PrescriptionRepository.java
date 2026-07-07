package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.PrescriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<PrescriptionEntity, Long> {
	List<PrescriptionEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<PrescriptionEntity> findByPatientIdAndAccountIdAndIsDeletedFalse(Long patientId, Long accountId);

	List<PrescriptionEntity> findByDoctorIdAndAccountIdAndIsDeletedFalse(Long doctorId, Long accountId);

	List<PrescriptionEntity> findByConsultationIdAndIsDeletedFalse(Long consultationId);

	List<PrescriptionEntity> findByAdmissionIdAndIsDeletedFalse(Long admissionId);
}