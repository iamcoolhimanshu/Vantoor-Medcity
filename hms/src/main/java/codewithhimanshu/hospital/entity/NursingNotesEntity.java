package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "hosp_nursing_notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NursingNotesEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long noteId;

	@Column(name = "admission_id", nullable = false)
	private Long admissionId;

	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@Column(name = "nurse_id")
	private Long nurseId;

	private String nurseName;

	@Column(columnDefinition = "TEXT")
	private String notes;

	private String vitalsBloodPressure;
	private String vitalsPulse;
	private String vitalsTemperature;
	private String vitalsSpO2;
	private String vitalsWeight;

	@Temporal(TemporalType.TIMESTAMP)
	private Date recordedAt;

	private String shift;
	private String noteType;

	@Column(name = "hospital_id")
	private Long hospitalId;
}