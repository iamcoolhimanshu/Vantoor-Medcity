package codewithhimanshu.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import codewithhimanshu.hospital.entity.NursingNotesEntity;

import java.util.List;

@Repository
public interface NursingNotesRepository extends JpaRepository<NursingNotesEntity, Long> {

	List<NursingNotesEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<NursingNotesEntity> findByAdmissionIdAndIsDeletedFalse(Long admissionId);

	List<NursingNotesEntity> findByPatientIdAndAccountIdAndIsDeletedFalse(Long patientId, Long accountId);

	List<NursingNotesEntity> findByNurseIdAndAccountIdAndIsDeletedFalse(Long nurseId, Long accountId);

	List<NursingNotesEntity> findByHospitalIdAndAccountIdAndIsDeletedFalse(Long hospitalId, Long accountId);

	List<NursingNotesEntity> findByAdmissionIdAndShiftAndIsDeletedFalse(Long admissionId, String shift);
}