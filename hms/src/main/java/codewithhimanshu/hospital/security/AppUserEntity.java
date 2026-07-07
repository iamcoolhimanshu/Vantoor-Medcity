package codewithhimanshu.hospital.security;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

/**
 * Stores login credentials for every HMS user.
 *
 * Roles:
 *  ROLE_ADMIN              → sees ALL accounts' data (accountId = null)
 *  ROLE_HOSPITAL_ADMIN     → scoped to their accountId
 *  ROLE_DOCTOR
 *  ROLE_RECEPTIONIST
 *  ROLE_BILLING_EXECUTIVE
 *  ROLE_WARD_MANAGER
 *  ROLE_FINANCE_ADMIN
 */
@Entity
@Table(name = "app_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    /** Tenant bucket. NULL for ADMIN (sees everything). */
    @Column(name = "account_id")
    private Long accountId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;   // BCrypt encoded

    /** e.g. "ROLE_ADMIN" or "ROLE_DOCTOR" */
    @Column(nullable = false)
    private String roles;

    @Builder.Default
    private Boolean isActive = true;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    void prePersist() {
        createdAt = new Date();
        if (isActive == null) isActive = true;
    }
}
