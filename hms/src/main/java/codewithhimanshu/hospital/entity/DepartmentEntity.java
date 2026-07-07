package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "hosp_department", uniqueConstraints = @UniqueConstraint(columnNames = { "hospital_id", "dept_name",
		"account_id" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class DepartmentEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long deptId;

	@NotNull(message = "Hospital is required")
	@Column(name = "hospital_id", nullable = false)
	private Long hospitalId;

	@NotBlank(message = "Department name is required")
	@Column(name = "dept_name", nullable = false)
	private String deptName;

	private String headDoctorId;
	private String description;
	private String operationalStatus; // ACTIVE, INACTIVE
}