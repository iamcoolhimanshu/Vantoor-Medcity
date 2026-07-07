package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.MedicineInventoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;

@Repository
public interface MedicineInventoryRepository extends JpaRepository<MedicineInventoryEntity, Long> {
	List<MedicineInventoryEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<MedicineInventoryEntity> findByHospitalIdAndAccountIdAndIsDeletedFalse(Long hospitalId, Long accountId);

	@Query("SELECT m FROM MedicineInventoryEntity m WHERE m.accountId = :accountId AND m.quantity <= m.lowStockAlertLevel AND m.isDeleted = false")
	List<MedicineInventoryEntity> findLowStockMedicines(@Param("accountId") Long accountId);

	@Query("SELECT m FROM MedicineInventoryEntity m WHERE m.accountId = :accountId AND m.expiryDate <= :date AND m.isDeleted = false")
	List<MedicineInventoryEntity> findExpiringMedicines(@Param("accountId") Long accountId, @Param("date") Date date);

	List<MedicineInventoryEntity> findByMedicineNameContainingIgnoreCaseAndAccountIdAndIsDeletedFalse(String name,
			Long accountId);
}