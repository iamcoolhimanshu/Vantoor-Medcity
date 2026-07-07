package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.WardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WardRepository extends JpaRepository<WardEntity, Long> {
	List<WardEntity> findByHospitalIdAndAccountIdAndIsDeletedFalse(Long hospitalId, Long accountId);

	List<WardEntity> findByAccountIdAndIsDeletedFalse(Long accountId);
}