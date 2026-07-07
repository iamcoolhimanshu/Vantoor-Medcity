package codewithhimanshu.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dashboard_widgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardWidgetEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dashboard_id")
    private Long dashboardId;

    @Column(nullable = false)
    private String widgetType; // KPI_CARD, LINE_CHART, BAR_CHART, PIE_CHART, etc.

    @Column(nullable = false)
    private String widgetTitle;

    @Column(nullable = false)
    private String dataSource; // PATIENTS, BILLING, INVENTORY, etc.

    @Column(columnDefinition = "TEXT")
    private String queryJson; // Custom JSON config for filters/queries

    private Integer positionX = 0;
    private Integer positionY = 0;
    private Integer width = 4;
    private Integer height = 3;

    @Column(columnDefinition = "TEXT")
    private String configJson; // Colors, options, custom html, refresh interval
}
