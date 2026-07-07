package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.MedicineDispensingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineDispensingRepository extends JpaRepository<MedicineDispensingEntity, Long> {

    List<MedicineDispensingEntity> findByPatientIdAndAccountIdAndIsDeletedFalse(Long patientId, Long accountId);

    List<MedicineDispensingEntity> findByPrescriptionIdAndIsDeletedFalse(Long prescriptionId);

    List<MedicineDispensingEntity> findByMedicineIdAndAccountIdAndIsDeletedFalse(Long medicineId, Long accountId);

    List<MedicineDispensingEntity> findByHospitalIdAndAccountIdAndIsDeletedFalse(Long hospitalId, Long accountId);

    @Query("SELECT d FROM MedicineDispensingEntity d WHERE d.accountId = :accountId AND d.isDeleted = false ORDER BY d.createdAt DESC")
    List<MedicineDispensingEntity> findAllByAccountIdOrderByCreatedAtDesc(@Param("accountId") Long accountId);
}
