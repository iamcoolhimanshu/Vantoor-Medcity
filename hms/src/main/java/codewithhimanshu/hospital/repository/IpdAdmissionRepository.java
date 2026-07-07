package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.IpdAdmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IpdAdmissionRepository extends JpaRepository<IpdAdmissionEntity, Long> {
	List<IpdAdmissionEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<IpdAdmissionEntity> findByPatientIdAndAccountIdAndIsDeletedFalse(Long patientId, Long accountId);

	List<IpdAdmissionEntity> findByDoctorIdAndAccountIdAndIsDeletedFalse(Long doctorId, Long accountId);

	List<IpdAdmissionEntity> findByHospitalIdAndAccountIdAndIsDeletedFalse(Long hospitalId, Long accountId);

	List<IpdAdmissionEntity> findByAdmissionStatusAndAccountIdAndIsDeletedFalse(String status, Long accountId);

	Optional<IpdAdmissionEntity> findByAdmissionNumberAndIsDeletedFalse(String admissionNumber);

	boolean existsByPatientIdAndAdmissionStatusAndIsDeletedFalse(Long patientId, String status);
}