package codewithhimanshu.dashboard.repository;

import codewithhimanshu.dashboard.entity.DashboardPermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DashboardPermissionRepository extends JpaRepository<DashboardPermissionEntity, Long> {
    List<DashboardPermissionEntity> findByDashboardId(Long dashboardId);
    void deleteByDashboardId(Long dashboardId);
    Optional<DashboardPermissionEntity> findByDashboardIdAndRoleName(Long dashboardId, String roleName);
}
