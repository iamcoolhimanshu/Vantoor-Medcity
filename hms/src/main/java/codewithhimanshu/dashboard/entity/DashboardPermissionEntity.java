package codewithhimanshu.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dashboard_permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardPermissionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dashboard_id")
    private Long dashboardId;

    @Column(nullable = false)
    private String roleName; // ROLE_ADMIN, ROLE_DOCTOR, etc.

    private Boolean canView = true;
    private Boolean canEdit = false;
    private Boolean canDelete = false;
}
