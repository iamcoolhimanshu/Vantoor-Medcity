package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.HospitalStaffEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalStaffRepository extends JpaRepository<HospitalStaffEntity, Long> {

    List<HospitalStaffEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

    List<HospitalStaffEntity> findByHospitalIdAndAccountIdAndIsDeletedFalse(Long hospitalId, Long accountId);

    List<HospitalStaffEntity> findByDeptIdAndAccountIdAndIsDeletedFalse(Long deptId, Long accountId);

    List<HospitalStaffEntity> findByStaffRoleAndAccountIdAndIsDeletedFalse(String role, Long accountId);

    List<HospitalStaffEntity> findByStatusAndHospitalIdAndAccountIdAndIsDeletedFalse(
            String status, Long hospitalId, Long accountId);

    Optional<HospitalStaffEntity> findByMobileNumberAndIsDeletedFalse(String mobile);

    boolean existsByMobileNumberAndAccountId(String mobile, Long accountId);
}
