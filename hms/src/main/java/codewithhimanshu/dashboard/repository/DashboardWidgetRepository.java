package codewithhimanshu.dashboard.repository;

import codewithhimanshu.dashboard.entity.DashboardWidgetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DashboardWidgetRepository extends JpaRepository<DashboardWidgetEntity, Long> {
    List<DashboardWidgetEntity> findByDashboardId(Long dashboardId);
    void deleteByDashboardId(Long dashboardId);
}
