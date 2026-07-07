package codewithhimanshu.hospital.entity;

import lombok.*;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.util.Date;

@Entity
@Table(name = "hosp_emergency")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class EmergencyEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long emergencyId;

	@Column(name = "emergency_number", unique = true)
	private String emergencyNumber;

	@Column(name = "patient_id")
	private Long patientId; // nullable if walk-in unknown patient

	private String patientName; // for unregistered patients
	private String patientMobile;
	private Integer patientAge;
	private String patientGender;

	@Column(name = "hospital_id")
	private Long hospitalId;

	@Column(name = "assigned_doctor_id", nullable = false)
	private Long assignedDoctorId;

	@Column(name = "bed_id")
	private Long bedId;

	@Column(nullable = false)
	private String severityLevel; // LOW, MODERATE, HIGH, CRITICAL

	@Column(nullable = false, columnDefinition = "TEXT")
	private String chiefComplaint;

	@Temporal(TemporalType.TIMESTAMP)
	private Date arrivalTime;

	@Temporal(TemporalType.TIMESTAMP)
	private Date triageTime;

	private String triageCategory;
	private String emergencyStatus;
	private String transportMode;

	@Column(columnDefinition = "TEXT")
	private String notes;

	private Boolean convertedToAdmission = false;
	private Long admissionId;
}