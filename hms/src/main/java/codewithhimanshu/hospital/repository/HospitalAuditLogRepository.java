package codewithhimanshu.hospital.repository;

import codewithhimanshu.hospital.entity.HospitalAuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalAuditLogRepository extends JpaRepository<HospitalAuditLogEntity, Long> {

    List<HospitalAuditLogEntity> findByAccountIdOrderByActionTimeDesc(Long accountId);

    List<HospitalAuditLogEntity> findByAccountIdAndModuleOrderByActionTimeDesc(Long accountId, String module);

    List<HospitalAuditLogEntity> findByAccountIdAndEntityTypeAndEntityIdOrderByActionTimeDesc(
            Long accountId, String entityType, String entityId);

    List<HospitalAuditLogEntity> findByUserIdOrderByActionTimeDesc(Long userId);
}
