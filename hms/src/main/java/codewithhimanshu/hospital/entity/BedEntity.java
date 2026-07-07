package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Entity
@Table(name = "hosp_bed", uniqueConstraints = @UniqueConstraint(columnNames = { "ward_id", "bed_number",
		"account_id" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BedEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long bedId;

	@NotNull
	@Column(name = "ward_id", nullable = false)
	private Long wardId;

	@NotNull
	@Column(name = "hospital_id", nullable = false)
	private Long hospitalId;

	@NotBlank(message = "Bed number is required")
	@Column(name = "bed_number", nullable = false)
	private String bedNumber;

	private String bedType;
	private String bedStatus;

	@Column(name = "current_patient_id")
	private Long currentPatientId;

	@Column(name = "current_admission_id")
	private Long currentAdmissionId;

	private BigDecimal dailyCharges;
	private String notes;
}