package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.Date;

@Entity
@Table(name = "hosp_opd_consultation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class OpdConsultationEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long consultationId;

	@Column(name = "consultation_number", unique = true)
	private String consultationNumber;

	@NotNull(message = "Patient ID is required")
	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@NotNull(message = "Doctor ID is required")
	@Column(name = "doctor_id", nullable = false)
	private Long doctorId;

	@NotNull(message = "Hospital ID is required")
	@Column(name = "hospital_id", nullable = false)
	private Long hospitalId;

	@NotNull(message = "Consultation date is required")
	@Temporal(TemporalType.TIMESTAMP)
	@Column(nullable = false)
	private Date consultationDate;

	private String vitalsBloodPressure;
	private String vitalsPulse;
	private String vitalsTemperature;
	private String vitalsWeight;
	private String vitalsHeight;
	private String vitalsSpO2;

	@NotBlank(message = "Diagnosis is required")
	@Column(nullable = false, columnDefinition = "TEXT")
	private String diagnosis;

	@Column(columnDefinition = "TEXT")
	private String symptoms;

	@Column(columnDefinition = "TEXT")
	private String doctorNotes;

	@Column(columnDefinition = "TEXT")
	private String clinicalFindings;

	private String consultationType; // NEW, FOLLOW_UP, EMERGENCY
	private String consultationStatus; // SCHEDULED, COMPLETED, CANCELLED

	@Temporal(TemporalType.DATE)
	private Date followUpDate;

	private String referredToDoctor;
	private Boolean requiresAdmission = false;
}