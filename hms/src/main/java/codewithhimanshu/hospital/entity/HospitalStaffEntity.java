package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.Date;

/**
 * Represents nurses, ward boys, lab technicians, and other hospital staff.
 * Referenced in PRD: Staff Management, Attendance & Shift Management.
 */
@Entity
@Table(name = "hosp_staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class HospitalStaffEntity extends HospitalBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long staffId;

    @Column(name = "staff_code", unique = true)
    private String staffCode;

    @NotBlank(message = "Staff name is required")
    @Size(min = 3, message = "Staff name must be at least 3 characters")
    @Column(nullable = false)
    private String staffName;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be exactly 10 digits")
    @Column(unique = true, nullable = false)
    private String mobileNumber;

    private String email;
    private String address;
    private String gender;

    @Temporal(TemporalType.DATE)
    private Date dateOfBirth;

    /** NURSE, LAB_TECHNICIAN, WARD_BOY, RECEPTIONIST, PHARMACIST, ADMIN_STAFF */
    @NotBlank(message = "Staff role is required")
    @Column(nullable = false)
    private String staffRole;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "dept_id")
    private Long deptId;

    /** MORNING, AFTERNOON, NIGHT, ROTATIONAL */
    private String shiftType;

    private String qualification;
    private String licenseNumber;

    @Temporal(TemporalType.DATE)
    private Date joiningDate;

    /** ACTIVE, INACTIVE, ON_LEAVE, RESIGNED */
    private String status;

    private String profileImageUrl;
}
