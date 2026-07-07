package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "hosp_ipd_admission")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class IpdAdmissionEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long admissionId;

	@Column(name = "admission_number", unique = true)
	private String admissionNumber;

	@NotNull(message = "Patient ID is required")
	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@NotNull(message = "Doctor ID is required")
	@Column(name = "doctor_id", nullable = false)
	private Long doctorId;

	@NotNull(message = "Hospital ID is required")
	@Column(name = "hospital_id", nullable = false)
	private Long hospitalId;

	@NotNull(message = "Ward ID is required")
	@Column(name = "ward_id", nullable = false)
	private Long wardId;

	@NotNull(message = "Bed ID is required")
	@Column(name = "bed_id", nullable = false)
	private Long bedId;

	@NotBlank(message = "Admission reason is required")
	@Column(nullable = false)
	private String admissionReason;

	@Temporal(TemporalType.TIMESTAMP)
	private Date admissionDate;

	@Temporal(TemporalType.TIMESTAMP)
	private Date dischargeDate;

	private String admissionType; // EMERGENCY, SCHEDULED, TRANSFER
	private String admissionStatus; // PENDING, ADMITTED, DISCHARGED, CANCELLED
	private String priority; // NORMAL, HIGH, CRITICAL

	private BigDecimal depositAmount;
	private String insurancePolicyNumber;
	private String insuranceProvider;
	private Boolean isInsuranceCase = false;
	private String insuranceStatus; // PENDING, APPROVED, REJECTED
	private String insuranceAuthCode;

	@Column(columnDefinition = "TEXT")
	private String admissionNotes;

	@Column(name = "assigned_nurse_id")
	private Long assignedNurseId;

	private String diagnosisOnAdmission;
}