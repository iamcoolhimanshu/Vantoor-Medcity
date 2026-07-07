package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "hosp_ot_schedule")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class OtScheduleEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long otId;

	@Column(name = "ot_number", unique = true)
	private String otNumber;

	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@Column(name = "surgeon_id", nullable = false)
	private Long surgeonId;

	@Column(name = "admission_id")
	private Long admissionId;

	@Column(name = "hospital_id")
	private Long hospitalId;

	@Column(name = "ot_room")
	private String otRoom;

	@Column(nullable = false)
	private String procedureName;

	private String anesthesiaType;
	private String anesthesiaDoctorId;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(nullable = false)
	private Date scheduledStartTime;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(nullable = false)
	private Date scheduledEndTime;

	@Temporal(TemporalType.TIMESTAMP)
	private Date actualStartTime;

	@Temporal(TemporalType.TIMESTAMP)
	private Date actualEndTime;

	private String otStatus; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, POSTPONED

	@Column(columnDefinition = "TEXT")
	private String preOpNotes;

	@Column(columnDefinition = "TEXT")
	private String postOpNotes;

	@Column(columnDefinition = "TEXT")
	private String otTeam; // JSON: list of staff

	private BigDecimal otCharges;
	private String priority; // ELECTIVE, URGENT, EMERGENCY
}