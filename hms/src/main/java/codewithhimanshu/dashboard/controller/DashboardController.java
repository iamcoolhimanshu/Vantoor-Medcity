package codewithhimanshu.dashboard.controller;

import codewithhimanshu.dashboard.entity.DashboardMasterEntity;
import codewithhimanshu.dashboard.entity.DashboardPermissionEntity;
import codewithhimanshu.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
@RequiredArgsConstructor
@Tag(name = "Dashboard Builder / Analytics Studio")
public class DashboardController {

    private final DashboardService service;

    @PostMapping("/create")
    @Operation(summary = "Create a custom dashboard layout")
    public ResponseEntity<DashboardMasterEntity> createDashboard(@RequestBody DashboardMasterEntity dashboard) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createDashboard(dashboard));
    }

    @PutMapping("/update/{id}")
    @Operation(summary = "Update an existing dashboard layout and widgets list")
    public ResponseEntity<DashboardMasterEntity> updateDashboard(@PathVariable Long id, @RequestBody DashboardMasterEntity dashboard) {
        return ResponseEntity.ok(service.updateDashboard(id, dashboard));
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Delete (soft delete) a dashboard layout")
    public ResponseEntity<Void> deleteDashboard(@PathVariable Long id) {
        service.deleteDashboard(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    @Operation(summary = "Get all dashboards accessible to current user role and tenant")
    public ResponseEntity<List<DashboardMasterEntity>> getAllDashboards() {
        return ResponseEntity.ok(service.getAllDashboards());
    }

    @GetMapping("/{id:\\d+}")
    @Operation(summary = "Get specific dashboard configuration details")
    public ResponseEntity<DashboardMasterEntity> getDashboardById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getDashboardById(id));
    }

    @PostMapping("/publish/{id}")
    @Operation(summary = "Publish a dashboard")
    public ResponseEntity<DashboardMasterEntity> publishDashboard(@PathVariable Long id) {
        return ResponseEntity.ok(service.publishDashboard(id));
    }

    @PostMapping("/clone/{id}")
    @Operation(summary = "Clone/duplicate a dashboard configuration")
    public ResponseEntity<DashboardMasterEntity> cloneDashboard(@PathVariable Long id) {
        return ResponseEntity.ok(service.cloneDashboard(id));
    }

    @PostMapping("/share/{id}")
    @Operation(summary = "Update dashboard role permissions list")
    public ResponseEntity<DashboardMasterEntity> shareDashboard(@PathVariable Long id, @RequestBody List<DashboardPermissionEntity> permissions) {
        return ResponseEntity.ok(service.shareDashboard(id, permissions));
    }

    @GetMapping("/widgets")
    @Operation(summary = "Retrieve lists of all available widget components and metadata")
    public ResponseEntity<List<Map<String, String>>> getAvailableWidgets() {
        List<Map<String, String>> widgets = new ArrayList<>();
        
        widgets.add(Map.of("widgetType", "KPI_CARD", "label", "KPI Card", "desc", "Displays counter or total sums."));
        widgets.add(Map.of("widgetType", "LINE_CHART", "label", "Line Chart", "desc", "Draws line graph representation."));
        widgets.add(Map.of("widgetType", "BAR_CHART", "label", "Bar Chart", "desc", "Draws vertical bar comparisons."));
        widgets.add(Map.of("widgetType", "PIE_CHART", "label", "Pie Chart", "desc", "Draws breakdown sizing slices."));
        widgets.add(Map.of("widgetType", "AREA_CHART", "label", "Area Chart", "desc", "Draws shaded trends over timeline."));
        widgets.add(Map.of("widgetType", "TABLE", "label", "Data Table", "desc", "Renders lists of records in row cells."));
        widgets.add(Map.of("widgetType", "DONUT_CHART", "label", "Donut Chart", "desc", "Renders ring proportions chart."));
        widgets.add(Map.of("widgetType", "GAUGE", "label", "Gauge Widget", "desc", "Renders dynamic dial indicator."));
        widgets.add(Map.of("widgetType", "PROGRESS_BAR", "label", "Progress Bar", "desc", "Renders percentage tracker bar."));
        widgets.add(Map.of("widgetType", "CALENDAR", "label", "Calendar Grid", "desc", "Shows admission dates highlights."));
        widgets.add(Map.of("widgetType", "ANNOUNCEMENTS", "label", "Announcements", "desc", "Displays scrolling broadcast feeds."));
        widgets.add(Map.of("widgetType", "NOTIFICATIONS", "label", "Notifications", "desc", "Renders standard real-time alert feed."));
        widgets.add(Map.of("widgetType", "AI_INSIGHTS_CARD", "label", "AI Insights", "desc", "Synthesizes clinical statistics warnings."));
        widgets.add(Map.of("widgetType", "LIVE_COUNTER", "label", "Live Counter", "desc", "Ticking live metric tracker."));

        return ResponseEntity.ok(widgets);
    }

    @PostMapping("/ai-generate")
    @Operation(summary = "Generate a custom dashboard layout using natural language prompt")
    public ResponseEntity<DashboardMasterEntity> generateDashboardWithAI(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        if (prompt == null || prompt.trim().isEmpty()) {
            throw new IllegalArgumentException("Prompt is required");
        }
        return ResponseEntity.ok(service.generateDashboardWithAI(prompt));
    }

    @GetMapping("/ai-insights/{id}")
    @Operation(summary = "Generate AI insights bullets for dashboard metrics")
    public ResponseEntity<Map<String, Object>> generateAIInsights(@PathVariable Long id) {
        return ResponseEntity.ok(service.generateAIInsights(id));
    }

    @GetMapping("/data")
    @Operation(summary = "Retrieve aggregated dataset for a custom dashboard widget")
    public ResponseEntity<Map<String, Object>> getWidgetData(
            @RequestParam String dataSource,
            @RequestParam String widgetType,
            @RequestParam(required = false) String queryJson) {
        return ResponseEntity.ok(service.getWidgetAnalyticsData(dataSource, widgetType, queryJson));
    }
}
