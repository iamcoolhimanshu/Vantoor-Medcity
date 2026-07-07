package codewithhimanshu.dashboard.entity;

import codewithhimanshu.hospital.entity.HospitalBaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dashboard_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class DashboardMasterEntity extends HospitalBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dashboard_name", nullable = false)
    private String dashboardName;

    private String description;

    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "role_type")
    private String roleType; // e.g. ROLE_DOCTOR, ROLE_ADMIN, etc.

    private String status; // DRAFT, PUBLISHED

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "dashboard_id")
    @Builder.Default
    private List<DashboardWidgetEntity> widgets = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "dashboard_id")
    @Builder.Default
    private List<DashboardPermissionEntity> permissions = new ArrayList<>();
}
