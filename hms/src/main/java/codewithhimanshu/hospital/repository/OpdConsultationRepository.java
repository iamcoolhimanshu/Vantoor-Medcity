package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.OpdConsultationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OpdConsultationRepository extends JpaRepository<OpdConsultationEntity, Long> {
	List<OpdConsultationEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<OpdConsultationEntity> findByPatientIdAndAccountIdAndIsDeletedFalse(Long patientId, Long accountId);

	List<OpdConsultationEntity> findByDoctorIdAndAccountIdAndIsDeletedFalse(Long doctorId, Long accountId);

	List<OpdConsultationEntity> findByHospitalIdAndAccountIdAndIsDeletedFalse(Long hospitalId, Long accountId);
}