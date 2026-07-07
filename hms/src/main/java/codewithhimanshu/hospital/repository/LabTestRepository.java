package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.LabTestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LabTestRepository extends JpaRepository<LabTestEntity, Long> {
	List<LabTestEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<LabTestEntity> findByPatientIdAndAccountIdAndIsDeletedFalse(Long patientId, Long accountId);

	List<LabTestEntity> findByAdmissionIdAndIsDeletedFalse(Long admissionId);

	List<LabTestEntity> findByConsultationIdAndIsDeletedFalse(Long consultationId);

	List<LabTestEntity> findByTestStatusAndAccountId(String status, Long accountId);

	List<LabTestEntity> findByIsCriticalTrueAndAccountId(Long accountId);
}