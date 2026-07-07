package codewithhimanshu.dashboard.repository;

import codewithhimanshu.dashboard.entity.DashboardMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DashboardMasterRepository extends JpaRepository<DashboardMasterEntity, Long> {

    List<DashboardMasterEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

    List<DashboardMasterEntity> findByIsDeletedFalse();

    Optional<DashboardMasterEntity> findByIdAndIsDeletedFalse(Long id);

    @Query("SELECT d FROM DashboardMasterEntity d WHERE d.isDeleted = false AND " +
           "(d.accountId = :accountId OR d.id IN (SELECT p.dashboardId FROM DashboardPermissionEntity p WHERE p.roleName = :roleName AND p.canView = true))")
    List<DashboardMasterEntity> findAccessibleDashboards(@Param("accountId") Long accountId, @Param("roleName") String roleName);
}
