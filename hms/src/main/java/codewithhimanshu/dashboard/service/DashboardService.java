package codewithhimanshu.dashboard.service;

import codewithhimanshu.ai.service.GroqClient;
import codewithhimanshu.appointment.entity.Appointment_t;
import codewithhimanshu.appointment.repository.Appointment_Repository;
import codewithhimanshu.communication.entity.AnnouncementEntity;
import codewithhimanshu.communication.entity.NotificationEntity;
import codewithhimanshu.communication.repository.AnnouncementRepository;
import codewithhimanshu.communication.repository.NotificationRepository;
import codewithhimanshu.dashboard.entity.DashboardMasterEntity;
import codewithhimanshu.dashboard.entity.DashboardPermissionEntity;
import codewithhimanshu.dashboard.entity.DashboardWidgetEntity;
import codewithhimanshu.dashboard.repository.DashboardMasterRepository;
import codewithhimanshu.dashboard.repository.DashboardPermissionRepository;
import codewithhimanshu.dashboard.repository.DashboardWidgetRepository;
import codewithhimanshu.hospital.entity.*;
import codewithhimanshu.hospital.repository.*;
import codewithhimanshu.hospital.service.AppUserService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardMasterRepository masterRepo;
    private final DashboardWidgetRepository widgetRepo;
    private final DashboardPermissionRepository permissionRepo;

    // Existing modules repositories
    private final PatientRepository patientRepo;
    private final DoctorRepository doctorRepo;
    private final HospitalStaffRepository staffRepo;
    private final MedicineInventoryRepository medicineRepo;
    private final HospitalInvoiceRepository invoiceRepo;
    private final InsuranceClaimRepository insuranceRepo;
    private final LabTestRepository labTestRepo;
    private final Appointment_Repository appointmentRepo;
    private final DepartmentRepository deptRepo;
    private final EmergencyRepository emergencyRepo;
    private final IpdAdmissionRepository admissionRepo;
    private final DynamicFormRepository formRepo;
    private final DynamicFormSubmissionRepository submissionRepo;
    private final AnnouncementRepository announcementRepo;
    private final NotificationRepository notificationRepo;

    private final AppUserService appUserService;
    private final GroqClient groqClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private Long getAccountId() {
        return appUserService.getLoggedInUserAccountId();
    }

    private Long getUserId() {
        try {
            return appUserService.getLoggedInUserId();
        } catch (Exception e) {
            return null;
        }
    }

    private String getLoggedInUserRole() {
        try {
            // Fetch roles of currently logged in user (e.g. ROLE_ADMIN, ROLE_DOCTOR, etc.)
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                return auth.getAuthorities().stream()
                        .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                        .findFirst().orElse("ROLE_STAFF");
            }
        } catch (Exception e) {
            log.warn("Could not determine logged in user role", e);
        }
        return "ROLE_STAFF";
    }

    // ─────────────────────────────────────────────────────────────
    // CRUD Operations for Dashboard Builder
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public DashboardMasterEntity createDashboard(DashboardMasterEntity dashboard) {
        Long accountId = getAccountId();
        dashboard.setAccountId(accountId);
        dashboard.setCreatedBy(getUserId());
        dashboard.setUpdatedBy(getUserId());
        dashboard.setIsDeleted(false);
        dashboard.setIsActive(true);

        if (Boolean.TRUE.equals(dashboard.getIsDefault())) {
            resetDefaultDashboard(accountId);
        }

        // Setup owner ID
        dashboard.setOwnerId(getUserId());

        if (dashboard.getWidgets() != null) {
            for (DashboardWidgetEntity w : dashboard.getWidgets()) {
                w.setDashboardId(dashboard.getId());
            }
        }

        if (dashboard.getPermissions() != null) {
            for (DashboardPermissionEntity p : dashboard.getPermissions()) {
                p.setDashboardId(dashboard.getId());
            }
        }

        return masterRepo.save(dashboard);
    }

    @Transactional
    public DashboardMasterEntity updateDashboard(Long id, DashboardMasterEntity updated) {
        DashboardMasterEntity existing = masterRepo.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dashboard not found"));

        // Tenant verification
        Long tenantId = getAccountId();
        if (tenantId != null && !tenantId.equals(existing.getAccountId()) && !appUserService.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this dashboard");
        }

        existing.setDashboardName(updated.getDashboardName());
        existing.setDescription(updated.getDescription());
        existing.setRoleType(updated.getRoleType());
        existing.setStatus(updated.getStatus());
        existing.setIsDefault(updated.getIsDefault());
        existing.setUpdatedBy(getUserId());

        if (Boolean.TRUE.equals(updated.getIsDefault())) {
            resetDefaultDashboard(tenantId);
        }

        // Replace widgets
        existing.getWidgets().clear();
        if (updated.getWidgets() != null) {
            for (DashboardWidgetEntity w : updated.getWidgets()) {
                w.setDashboardId(id);
                existing.getWidgets().add(w);
            }
        }

        // Replace permissions
        existing.getPermissions().clear();
        if (updated.getPermissions() != null) {
            for (DashboardPermissionEntity p : updated.getPermissions()) {
                p.setDashboardId(id);
                existing.getPermissions().add(p);
            }
        }

        return masterRepo.save(existing);
    }

    @Transactional
    public void deleteDashboard(Long id) {
        DashboardMasterEntity dashboard = masterRepo.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dashboard not found"));

        Long tenantId = getAccountId();
        if (tenantId != null && !tenantId.equals(dashboard.getAccountId()) && !appUserService.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to delete dashboard");
        }

        dashboard.setIsDeleted(true);
        dashboard.setIsActive(false);
        dashboard.setUpdatedBy(getUserId());
        masterRepo.save(dashboard);
    }

    public List<DashboardMasterEntity> getAllDashboards() {
        Long tenantId = getAccountId();
        String currentRole = getLoggedInUserRole();

        if (appUserService.isAdmin()) {
            return masterRepo.findByIsDeletedFalse();
        }

        // Super Admins see everything, Hospital Admins scope to their accountId.
        // Other roles can see dashboards shared with their role.
        return masterRepo.findAccessibleDashboards(tenantId, currentRole);
    }

    public DashboardMasterEntity getDashboardById(Long id) {
        DashboardMasterEntity dashboard = masterRepo.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dashboard not found"));

        Long tenantId = getAccountId();
        if (tenantId != null && !tenantId.equals(dashboard.getAccountId()) && !appUserService.isAdmin()) {
            // Check if user role has viewing permission
            String currentRole = getLoggedInUserRole();
            boolean canView = dashboard.getPermissions().stream()
                    .anyMatch(p -> p.getRoleName().equalsIgnoreCase(currentRole) && Boolean.TRUE.equals(p.getCanView()));
            if (!canView) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this dashboard layout");
            }
        }

        return dashboard;
    }

    @Transactional
    public DashboardMasterEntity publishDashboard(Long id) {
        DashboardMasterEntity dashboard = getDashboardById(id);
        dashboard.setStatus("PUBLISHED");
        dashboard.setUpdatedBy(getUserId());
        return masterRepo.save(dashboard);
    }

    @Transactional
    public DashboardMasterEntity cloneDashboard(Long id) {
        DashboardMasterEntity existing = getDashboardById(id);

        DashboardMasterEntity cloned = DashboardMasterEntity.builder()
                .dashboardName(existing.getDashboardName() + " (Clone)")
                .description(existing.getDescription())
                .roleType(existing.getRoleType())
                .status("DRAFT")
                .isDefault(false)
                .ownerId(getUserId())
                .build();

        cloned.setAccountId(existing.getAccountId());
        cloned.setCreatedBy(getUserId());
        cloned.setUpdatedBy(getUserId());
        cloned.setIsActive(true);
        cloned.setIsDeleted(false);

        List<DashboardWidgetEntity> clonedWidgets = existing.getWidgets().stream()
                .map(w -> DashboardWidgetEntity.builder()
                        .widgetType(w.getWidgetType())
                        .widgetTitle(w.getWidgetTitle())
                        .dataSource(w.getDataSource())
                        .queryJson(w.getQueryJson())
                        .positionX(w.getPositionX())
                        .positionY(w.getPositionY())
                        .width(w.getWidth())
                        .height(w.getHeight())
                        .configJson(w.getConfigJson())
                        .build())
                .collect(Collectors.toList());

        List<DashboardPermissionEntity> clonedPermissions = existing.getPermissions().stream()
                .map(p -> DashboardPermissionEntity.builder()
                        .roleName(p.getRoleName())
                        .canView(p.getCanView())
                        .canEdit(p.getCanEdit())
                        .canDelete(p.getCanDelete())
                        .build())
                .collect(Collectors.toList());

        cloned.setWidgets(clonedWidgets);
        cloned.setPermissions(clonedPermissions);

        return masterRepo.save(cloned);
    }

    @Transactional
    public DashboardMasterEntity shareDashboard(Long id, List<DashboardPermissionEntity> permissions) {
        DashboardMasterEntity dashboard = getDashboardById(id);
        dashboard.getPermissions().clear();
        for (DashboardPermissionEntity p : permissions) {
            p.setDashboardId(id);
            dashboard.getPermissions().add(p);
        }
        dashboard.setUpdatedBy(getUserId());
        return masterRepo.save(dashboard);
    }

    private void resetDefaultDashboard(Long accountId) {
        List<DashboardMasterEntity> defaults = masterRepo.findByAccountIdAndIsDeletedFalse(accountId);
        for (DashboardMasterEntity d : defaults) {
            if (Boolean.TRUE.equals(d.getIsDefault())) {
                d.setIsDefault(false);
                masterRepo.save(d);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Dynamic Query Generator for Widgets Data
    // ─────────────────────────────────────────────────────────────

    public Map<String, Object> getWidgetAnalyticsData(String dataSource, String widgetType, String queryJson) {
        Long accountId = getAccountId();
        Map<String, Object> result = new LinkedHashMap<>();

        Map<String, Object> queryMap = new HashMap<>();
        if (queryJson != null && !queryJson.trim().isEmpty()) {
            try {
                queryMap = objectMapper.readValue(queryJson, new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse queryJson for widget: {}", queryJson);
            }
        }

        String filterDept = (String) queryMap.get("department");
        String dateRange = (String) queryMap.get("dateRange"); // TODAY, LAST_7_DAYS, LAST_30_DAYS, ALL
        String metric = (String) queryMap.get("metric"); // COUNT, SUM, AVG, TREND, CATEGORY_BREAKDOWN, REVENUE, PENDING, LOW_STOCK, EXPIRING

        LocalDate startDate = getStartDate(dateRange);

        switch (dataSource.toUpperCase()) {
            case "PATIENTS":
                List<PatientEntity> patients = patientRepo.findByAccountIdAndIsDeletedFalse(accountId);
                // Filter by date range
                if (startDate != null) {
                    patients = patients.stream()
                            .filter(p -> p.getCreatedAt() != null && toLocalDate(p.getCreatedAt()).isAfter(startDate.minusDays(1)))
                            .collect(Collectors.toList());
                }
                // Filter by department (if maps to patient fields)
                if (filterDept != null && !filterDept.trim().isEmpty()) {
                    patients = patients.stream()
                            .filter(p -> p.getProblem() != null && p.getProblem().toLowerCase().contains(filterDept.toLowerCase()))
                            .collect(Collectors.toList());
                }

                if ("GENDER_BREAKDOWN".equalsIgnoreCase(metric)) {
                    result.put("data", patients.stream()
                            .collect(Collectors.groupingBy(p -> p.getGender() != null ? p.getGender() : "Unknown", Collectors.counting())));
                } else if ("TYPE_BREAKDOWN".equalsIgnoreCase(metric)) {
                    result.put("data", patients.stream()
                            .collect(Collectors.groupingBy(p -> p.getPatientType() != null ? p.getPatientType() : "OPD", Collectors.counting())));
                } else if ("TREND".equalsIgnoreCase(metric)) {
                    Map<String, Long> trend = patients.stream()
                            .filter(p -> p.getCreatedAt() != null)
                            .collect(Collectors.groupingBy(p -> formatDate(p.getCreatedAt()), TreeMap::new, Collectors.counting()));
                    result.put("data", trend);
                } else if ("LIST".equalsIgnoreCase(metric) || "TABLE".equalsIgnoreCase(widgetType)) {
                    result.put("data", patients.stream().sorted(Comparator.comparing(PatientEntity::getCreatedAt).reversed()).limit(15).collect(Collectors.toList()));
                } else {
                    result.put("value", patients.size());
                }
                break;

            case "APPOINTMENTS":
                List<Appointment_t> appointments = appointmentRepo.findByAccountIdOrderByAppointmentDateDescStartTimeDesc(accountId);
                if (startDate != null) {
                    appointments = appointments.stream()
                            .filter(a -> a.getAppointmentDate() != null && a.getAppointmentDate().isAfter(startDate.minusDays(1)))
                            .collect(Collectors.toList());
                }
                if (filterDept != null && !filterDept.trim().isEmpty()) {
                    appointments = appointments.stream()
                            .filter(a -> a.getServiceName() != null && a.getServiceName().toLowerCase().contains(filterDept.toLowerCase()))
                            .collect(Collectors.toList());
                }

                if ("STATUS_BREAKDOWN".equalsIgnoreCase(metric)) {
                    result.put("data", appointments.stream()
                            .collect(Collectors.groupingBy(a -> a.getStatus() != null ? a.getStatus() : "SCHEDULED", Collectors.counting())));
                } else if ("TREND".equalsIgnoreCase(metric)) {
                    Map<String, Long> trend = appointments.stream()
                            .filter(a -> a.getAppointmentDate() != null)
                            .collect(Collectors.groupingBy(a -> a.getAppointmentDate().toString(), TreeMap::new, Collectors.counting()));
                    result.put("data", trend);
                } else if ("LIST".equalsIgnoreCase(metric) || "TABLE".equalsIgnoreCase(widgetType)) {
                    result.put("data", appointments.stream().limit(15).collect(Collectors.toList()));
                } else {
                    // Default COUNT
                    result.put("value", appointments.size());
                }
                break;

            case "BILLING":
                List<HospitalInvoiceEntity> invoices = invoiceRepo.findByAccountIdAndIsDeletedFalse(accountId);
                if (startDate != null) {
                    invoices = invoices.stream()
                            .filter(i -> i.getInvoiceDate() != null && toLocalDate(i.getInvoiceDate()).isAfter(startDate.minusDays(1)))
                            .collect(Collectors.toList());
                }

                if ("REVENUE".equalsIgnoreCase(metric)) {
                    BigDecimal total = invoices.stream()
                            .filter(i -> "PAID".equalsIgnoreCase(i.getPaymentStatus()))
                            .map(i -> i.getTotalAmount() != null ? i.getTotalAmount() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    result.put("value", total);
                } else if ("PENDING".equalsIgnoreCase(metric)) {
                    BigDecimal pending = invoices.stream()
                            .filter(i -> !"PAID".equalsIgnoreCase(i.getPaymentStatus()))
                            .map(i -> i.getPendingAmount() != null ? i.getPendingAmount() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    result.put("value", pending);
                } else if ("TREND".equalsIgnoreCase(metric)) {
                    Map<String, BigDecimal> trend = invoices.stream()
                            .filter(i -> i.getInvoiceDate() != null)
                            .collect(Collectors.groupingBy(i -> formatDate(i.getInvoiceDate()), TreeMap::new,
                                    Collectors.reducing(BigDecimal.ZERO, i -> i.getTotalAmount() != null ? i.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add)));
                    result.put("data", trend);
                } else if ("CATEGORY_BREAKDOWN".equalsIgnoreCase(metric)) {
                    Map<String, BigDecimal> breakdown = invoices.stream()
                            .collect(Collectors.groupingBy(i -> i.getBillingCategory() != null ? i.getBillingCategory() : "General",
                                    Collectors.reducing(BigDecimal.ZERO, i -> i.getTotalAmount() != null ? i.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add)));
                    result.put("data", breakdown);
                } else {
                    result.put("value", invoices.size());
                }
                break;

            case "INVENTORY":
            case "PHARMACY":
                List<MedicineInventoryEntity> meds = medicineRepo.findByAccountIdAndIsDeletedFalse(accountId);
                if ("LOW_STOCK".equalsIgnoreCase(metric)) {
                    List<MedicineInventoryEntity> lowStock = meds.stream()
                            .filter(m -> m.getQuantity() <= m.getLowStockAlertLevel())
                            .collect(Collectors.toList());
                    if ("TABLE".equalsIgnoreCase(widgetType)) {
                        result.put("data", lowStock);
                    } else {
                        result.put("value", lowStock.size());
                    }
                } else if ("EXPIRING".equalsIgnoreCase(metric)) {
                    Date threshold = new Date(System.currentTimeMillis() + (30L * 24 * 60 * 60 * 1000)); // 30 days
                    List<MedicineInventoryEntity> expiring = meds.stream()
                            .filter(m -> m.getExpiryDate() != null && m.getExpiryDate().before(threshold))
                            .collect(Collectors.toList());
                    if ("TABLE".equalsIgnoreCase(widgetType)) {
                        result.put("data", expiring);
                    } else {
                        result.put("value", expiring.size());
                    }
                } else if ("STOCK_LEVELS".equalsIgnoreCase(metric)) {
                    result.put("data", meds.stream().limit(10).collect(Collectors.toMap(MedicineInventoryEntity::getMedicineName, MedicineInventoryEntity::getQuantity)));
                } else {
                    result.put("value", meds.size());
                }
                break;

            case "DOCTORS":
                List<DoctorEntity> docs = doctorRepo.findByAccountIdAndIsDeletedFalse(accountId);
                if (filterDept != null && !filterDept.trim().isEmpty()) {
                    docs = docs.stream()
                            .filter(d -> d.getSpecialization() != null && d.getSpecialization().toLowerCase().contains(filterDept.toLowerCase()))
                            .collect(Collectors.toList());
                }

                if ("SPECIALIZATION_BREAKDOWN".equalsIgnoreCase(metric)) {
                    result.put("data", docs.stream()
                            .collect(Collectors.groupingBy(d -> d.getSpecialization() != null ? d.getSpecialization() : "General", Collectors.counting())));
                } else if ("AVAILABILITY".equalsIgnoreCase(metric)) {
                    long activeDocs = docs.stream().filter(d -> "ACTIVE".equalsIgnoreCase(d.getStatus())).count();
                    result.put("data", Map.of("Available", activeDocs, "Inactive", docs.size() - activeDocs));
                } else {
                    result.put("value", docs.size());
                }
                break;

            case "NURSES":
                List<HospitalStaffEntity> staff = staffRepo.findByAccountIdAndIsDeletedFalse(accountId);
                List<HospitalStaffEntity> nurses = staff.stream()
                        .filter(s -> "NURSE".equalsIgnoreCase(s.getStaffRole()))
                        .collect(Collectors.toList());
                result.put("value", nurses.size());
                if ("TABLE".equalsIgnoreCase(widgetType) || "LIST".equalsIgnoreCase(metric)) {
                    result.put("data", nurses);
                }
                break;

            case "INSURANCE":
                List<InsuranceClaimEntity> claims = insuranceRepo.findByAccountIdAndIsDeletedFalse(accountId);
                if ("PENDING".equalsIgnoreCase(metric)) {
                    long pendingClaims = claims.stream().filter(c -> "PENDING".equalsIgnoreCase(c.getClaimStatus())).count();
                    result.put("value", pendingClaims);
                } else if ("BREAKDOWN".equalsIgnoreCase(metric)) {
                    result.put("data", claims.stream()
                            .collect(Collectors.groupingBy(c -> c.getClaimStatus() != null ? c.getClaimStatus() : "SUBMITTED", Collectors.counting())));
                } else {
                    result.put("value", claims.size());
                }
                break;

            case "LABORATORY":
                List<LabTestEntity> tests = labTestRepo.findByAccountIdAndIsDeletedFalse(accountId);
                if ("PENDING".equalsIgnoreCase(metric)) {
                    long pendingTests = tests.stream().filter(t -> "ORDERED".equalsIgnoreCase(t.getTestStatus())).count();
                    result.put("value", pendingTests);
                } else if ("CRITICAL".equalsIgnoreCase(metric)) {
                    long critical = tests.stream().filter(t -> Boolean.TRUE.equals(t.getIsCritical())).count();
                    result.put("value", critical);
                } else if ("STATUS_BREAKDOWN".equalsIgnoreCase(metric)) {
                    result.put("data", tests.stream()
                            .collect(Collectors.groupingBy(t -> t.getTestStatus() != null ? t.getTestStatus() : "ORDERED", Collectors.counting())));
                } else {
                    result.put("value", tests.size());
                }
                break;

            case "AI_ANALYTICS":
                // Generate a statistical prediction trends JSON structure
                result.put("predictedPatientGrowth", generatePredictionList(12));
                result.put("predictedRevenueTrends", generatePredictionBigDecimalList(200000));
                result.put("predictedMedicineDemand", Map.of("Paracetamol", 85, "Amoxicillin", 60, "Ibuprofen", 45));
                break;

            case "DYNAMIC_FORMS":
                // Returns count of submissions
                long subs = submissionRepo.count(); // Generic fallback
                result.put("value", subs);
                break;

            case "ANNOUNCEMENTS":
                List<AnnouncementEntity> announces = announcementRepo.findAll().stream()
                        .filter(a -> !Boolean.TRUE.equals(a.getIsDeleted()))
                        .sorted(Comparator.comparing(AnnouncementEntity::getCreatedAt).reversed())
                        .limit(5)
                        .collect(Collectors.toList());
                result.put("data", announces);
                break;

            case "NOTIFICATIONS":
                List<NotificationEntity> notifs = notificationRepo.findAll().stream()
                        .filter(n -> !Boolean.TRUE.equals(n.getIsDeleted()))
                        .sorted(Comparator.comparing(NotificationEntity::getCreatedAt).reversed())
                        .limit(5)
                        .collect(Collectors.toList());
                result.put("data", notifs);
                break;

            default:
                result.put("value", 0);
                result.put("error", "Data source not recognized: " + dataSource);
                break;
        }

        return result;
    }

    private LocalDate getStartDate(String dateRange) {
        if (dateRange == null) return null;
        switch (dateRange.toUpperCase()) {
            case "TODAY":
                return LocalDate.now();
            case "LAST_7_DAYS":
                return LocalDate.now().minusDays(7);
            case "LAST_30_DAYS":
                return LocalDate.now().minusDays(30);
            default:
                return null;
        }
    }

    private LocalDate toLocalDate(Date date) {
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    }

    private String formatDate(Date date) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        return sdf.format(date);
    }

    private List<Map<String, Object>> generatePredictionList(int baseValue) {
        List<Map<String, Object>> list = new ArrayList<>();
        LocalDate today = LocalDate.now();
        Random rand = new Random();
        for (int i = 0; i < 7; i++) {
            Map<String, Object> day = new HashMap<>();
            day.put("date", today.plusDays(i).toString());
            day.put("predicted", baseValue + rand.nextInt(5));
            day.put("actual", i == 0 ? baseValue : null);
            list.add(day);
        }
        return list;
    }

    private List<Map<String, Object>> generatePredictionBigDecimalList(int baseValue) {
        List<Map<String, Object>> list = new ArrayList<>();
        LocalDate today = LocalDate.now();
        Random rand = new Random();
        for (int i = 0; i < 7; i++) {
            Map<String, Object> day = new HashMap<>();
            day.put("date", today.plusDays(i).toString());
            day.put("predicted", BigDecimal.valueOf(baseValue + rand.nextInt(50000)));
            day.put("actual", i == 0 ? BigDecimal.valueOf(baseValue) : null);
            list.add(day);
        }
        return list;
    }

    // ─────────────────────────────────────────────────────────────
    // AI Dashboard Generation & Insights
    // ─────────────────────────────────────────────────────────────

    public DashboardMasterEntity generateDashboardWithAI(String prompt) {
        String systemPrompt = "You are a hospital management system AI assistant. " +
                "Generate a complete dashboard configuration in JSON format matching the schema for the type of dashboard requested by the user. " +
                "The dashboard should contain professional metrics and widgets suited for the requested role/department.\n" +
                "Ensure positionX is from 0 to 8, width is between 2 and 6, height is between 2 and 4. Layout coordinates positionX and positionY should be arranged logically without overlapping.\n" +
                "You must strictly output a valid JSON object matching this schema. Do not include markdown code blocks or comment text.\n" +
                "Available dataSources are: PATIENTS, APPOINTMENTS, DOCTORS, NURSES, BILLING, INVENTORY, INSURANCE, PHARMACY, LABORATORY, AI_ANALYTICS, ANNOUNCEMENTS, NOTIFICATIONS.\n" +
                "Available widgetTypes are: KPI_CARD, LINE_CHART, BAR_CHART, PIE_CHART, AREA_CHART, TABLE, DONUT_CHART, GAUGE, PROGRESS_BAR, CALENDAR, ANNOUNCEMENTS, NOTIFICATIONS, AI_INSIGHTS_CARD, LIVE_COUNTER.\n" +
                "Schema format:\n" +
                "{\n" +
                "  \"dashboardName\": \"Emergency Care Analytics\",\n" +
                "  \"description\": \"Real-time clinical metrics for ER department\",\n" +
                "  \"roleType\": \"ROLE_ADMIN\",\n" +
                "  \"widgets\": [\n" +
                "    {\n" +
                "      \"widgetType\": \"KPI_CARD\",\n" +
                "      \"widgetTitle\": \"Active ER Claims\",\n" +
                "      \"dataSource\": \"INSURANCE\",\n" +
                "      \"queryJson\": \"{\\\"metric\\\":\\\"PENDING\\\"}\",\n" +
                "      \"positionX\": 0,\n" +
                "      \"positionY\": 0,\n" +
                "      \"width\": 3,\n" +
                "      \"height\": 2,\n" +
                "      \"configJson\": \"{\\\"color\\\":\\\"#DC2626\\\"}\"\n" +
                "    }\n" +
                "  ]\n" +
                "}";

        log.info("Generating AI dashboard with prompt: {}", prompt);
        String aiResponse = groqClient.getChatCompletion(systemPrompt, prompt);

        // Sanitize code blocks
        if (aiResponse.contains("```json")) {
            int start = aiResponse.indexOf("```json") + 7;
            int end = aiResponse.indexOf("```", start);
            if (end > start) aiResponse = aiResponse.substring(start, end).trim();
        } else if (aiResponse.contains("```")) {
            int start = aiResponse.indexOf("```") + 3;
            int end = aiResponse.indexOf("```", start);
            if (end > start) aiResponse = aiResponse.substring(start, end).trim();
        }

        try {
            DashboardMasterEntity dashboard = objectMapper.readValue(aiResponse, DashboardMasterEntity.class);
            // Save dashboard to database
            return createDashboard(dashboard);
        } catch (Exception e) {
            log.error("AI dashboard generation JSON parsing failed. Response was: {}", aiResponse, e);
            // Fallback dashboard
            DashboardMasterEntity fallback = DashboardMasterEntity.builder()
                    .dashboardName("Custom AI Generated Dashboard")
                    .description("Generated template for: " + prompt)
                    .roleType("ROLE_HOSPITAL_ADMIN")
                    .status("DRAFT")
                    .build();

            List<DashboardWidgetEntity> widgets = new ArrayList<>();
            widgets.add(DashboardWidgetEntity.builder()
                    .widgetType("KPI_CARD")
                    .widgetTitle("Total Patients")
                    .dataSource("PATIENTS")
                    .queryJson("{\"metric\":\"COUNT\"}")
                    .positionX(0).positionY(0).width(4).height(2)
                    .configJson("{\"color\":\"#0D9488\"}")
                    .build());
            widgets.add(DashboardWidgetEntity.builder()
                    .widgetType("BAR_CHART")
                    .widgetTitle("Revenue Trends")
                    .dataSource("BILLING")
                    .queryJson("{\"metric\":\"TREND\"}")
                    .positionX(4).positionY(0).width(8).height(3)
                    .configJson("{\"color\":\"#2563EB\"}")
                    .build());
            widgets.add(DashboardWidgetEntity.builder()
                    .widgetType("TABLE")
                    .widgetTitle("Low Stock Alerts")
                    .dataSource("PHARMACY")
                    .queryJson("{\"metric\":\"LOW_STOCK\"}")
                    .positionX(0).positionY(3).width(6).height(3)
                    .configJson("{\"color\":\"#DC2626\"}")
                    .build());
            widgets.add(DashboardWidgetEntity.builder()
                    .widgetType("AI_INSIGHTS_CARD")
                    .widgetTitle("AI Recommendations")
                    .dataSource("AI_ANALYTICS")
                    .queryJson("{}")
                    .positionX(6).positionY(3).width(6).height(3)
                    .configJson("{\"color\":\"#7C3AED\"}")
                    .build());

            fallback.setWidgets(widgets);
            return createDashboard(fallback);
        }
    }

    public Map<String, Object> generateAIInsights(Long dashboardId) {
        Long accountId = getAccountId();
        
        // Aggregate statistics to send to Groq
        long totalPatients = patientRepo.findByAccountIdAndIsDeletedFalse(accountId).size();
        long totalDocs = doctorRepo.findByAccountIdAndIsDeletedFalse(accountId).size();
        long activeAdmit = admissionRepo.findByAdmissionStatusAndAccountIdAndIsDeletedFalse("ADMITTED", accountId).size();
        long lowStock = medicineRepo.findLowStockMedicines(accountId).size();
        BigDecimal totalRevenue = invoiceRepo.sumTotalRevenue(accountId);
        long pendingClaims = insuranceRepo.findByClaimStatusAndAccountIdAndIsDeletedFalse("PENDING", accountId).size();

        String statsData = String.format(
            "Patients: %d, Doctors: %d, Admitted Patients: %d, Low Stock Medicines: %d, Revenue: %s, Pending Insurance Claims: %d",
            totalPatients, totalDocs, activeAdmit, lowStock, totalRevenue != null ? totalRevenue.toString() : "0.0", pendingClaims
        );

        String systemPrompt = "You are a hospital administration AI analyst. " +
                "You will be given current statistics of the hospital. " +
                "Analyze the numbers and output 3 bullet points of predictive or actionable clinical/operational insights. " +
                "Keep each insight short, professional, and specific. Do not use markdown backticks.\n" +
                "Your response must be a JSON object with a single key 'insights' containing an array of strings.\n" +
                "Example Output:\n" +
                "{\n" +
                "  \"insights\": [\n" +
                "    \"Admissions have increased this week. Consider adjusting ward boy staffing levels.\",\n" +
                "    \"At the current rate, low stock medicine inventory will run out in 5 days.\",\n" +
                "    \"Outstanding payments represent a significant fraction of billing. Recommend reviewing pending billing claims.\"\n" +
                "  ]\n" +
                "}";

        log.info("Generating AI Insights for dashboard statistics: {}", statsData);
        String aiResponse = groqClient.getChatCompletion(systemPrompt, statsData);

        if (aiResponse.contains("```json")) {
            int start = aiResponse.indexOf("```json") + 7;
            int end = aiResponse.indexOf("```", start);
            if (end > start) aiResponse = aiResponse.substring(start, end).trim();
        } else if (aiResponse.contains("```")) {
            int start = aiResponse.indexOf("```") + 3;
            int end = aiResponse.indexOf("```", start);
            if (end > start) aiResponse = aiResponse.substring(start, end).trim();
        }

        try {
            return objectMapper.readValue(aiResponse, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("AI Insights parsing failed for: {}", aiResponse, e);
            Map<String, Object> fallback = new HashMap<>();
            List<String> list = new ArrayList<>();
            list.add("Patient admissions are stable at " + totalPatients + " overall registrations.");
            if (lowStock > 0) {
                list.add("Warning: " + lowStock + " medicines are currently at low stock levels. Review pharmacy orders.");
            } else {
                list.add("Pharmacy inventory levels are healthy with zero low-stock alerts.");
            }
            list.add("Total collected revenue stands at INR " + (totalRevenue != null ? totalRevenue.toString() : "0") + ".");
            fallback.put("insights", list);
            return fallback;
        }
    }
}
