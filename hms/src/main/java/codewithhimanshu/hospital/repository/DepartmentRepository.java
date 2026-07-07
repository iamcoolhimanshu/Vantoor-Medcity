package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.DepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<DepartmentEntity, Long> {
	List<DepartmentEntity> findByHospitalIdAndAccountIdAndIsDeletedFalse(Long hospitalId, Long accountId);

	List<DepartmentEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	boolean existsByDeptNameAndHospitalIdAndAccountId(String name, Long hospitalId, Long accountId);
}