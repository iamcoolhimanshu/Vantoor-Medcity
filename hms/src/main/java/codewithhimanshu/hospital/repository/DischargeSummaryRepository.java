package codewithhimanshu.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import codewithhimanshu.hospital.entity.DischargeSummaryEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface DischargeSummaryRepository extends JpaRepository<DischargeSummaryEntity, Long> {

	Optional<DischargeSummaryEntity> findByAdmissionIdAndIsDeletedFalse(Long admissionId);

	List<DischargeSummaryEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<DischargeSummaryEntity> findByPatientIdAndAccountIdAndIsDeletedFalse(Long patientId, Long accountId);

	List<DischargeSummaryEntity> findByDoctorIdAndAccountIdAndIsDeletedFalse(Long doctorId, Long accountId);

	List<DischargeSummaryEntity> findByHospitalIdAndAccountIdAndIsDeletedFalse(Long hospitalId, Long accountId);

	List<DischargeSummaryEntity> findByStatusAndAccountIdAndIsDeletedFalse(String status, Long accountId);
}