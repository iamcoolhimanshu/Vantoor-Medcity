package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.Date;

@Entity
@Table(name = "hosp_prescription")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PrescriptionEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long prescriptionId;

	@Column(name = "prescription_number", unique = true)
	private String prescriptionNumber;

	@NotNull
	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@NotNull
	@Column(name = "doctor_id", nullable = false)
	private Long doctorId;

	@Column(name = "consultation_id")
	private Long consultationId;

	@Column(name = "admission_id")
	private Long admissionId;

	@Column(name = "hospital_id")
	private Long hospitalId;

	@Temporal(TemporalType.DATE)
	private Date prescriptionDate;

	@Column(columnDefinition = "TEXT")
	private String notes;

	private String prescriptionType;
	private String status;

	@Column(columnDefinition = "TEXT", nullable = false)
	private String medicines;

	private String doctorSignature;
	private Boolean isRefillAllowed = false;
	private Integer refillCount = 0;
}