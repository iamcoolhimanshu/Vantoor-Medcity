package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "hosp_lab_test")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class LabTestEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long labTestId;

	@Column(name = "lab_order_number", unique = true)
	private String labOrderNumber;

	@NotNull
	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@NotNull
	@Column(name = "doctor_id", nullable = false)
	private Long doctorId;

	@Column(name = "hospital_id")
	private Long hospitalId;

	@Column(name = "consultation_id")
	private Long consultationId;

	@Column(name = "admission_id")
	private Long admissionId;

	@NotBlank(message = "Test name is required")
	@Column(nullable = false)
	private String testName;

	private String testCategory; // BLOOD, URINE, XRAY, MRI, CT, ECG, etc.

	@NotBlank(message = "Sample status is required")
	private String sampleStatus; // PENDING_COLLECTION, COLLECTED, PROCESSING, COMPLETED

	@Temporal(TemporalType.TIMESTAMP)
	private Date orderedDate;

	@Temporal(TemporalType.TIMESTAMP)
	private Date sampleCollectedDate;

	@Temporal(TemporalType.TIMESTAMP)
	private Date resultDate;

	@Column(columnDefinition = "TEXT")
	private String result;

	private String resultStatus; // NORMAL, ABNORMAL, CRITICAL
	private String reportUrl;
	private Boolean isCritical = false;
	private String notes;
	private BigDecimal testCharges;
	private String testStatus; // ORDERED, SAMPLE_COLLECTED, IN_PROGRESS, COMPLETED, CANCELLED

	@Column(name = "lab_technician_id")
	private Long labTechnicianId;
}