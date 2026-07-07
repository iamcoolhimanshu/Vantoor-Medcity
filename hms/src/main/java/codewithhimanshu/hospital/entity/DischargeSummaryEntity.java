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
@Table(name = "hosp_discharge_summary")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class DischargeSummaryEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long dischargeId;

	@Column(name = "admission_id", unique = true, nullable = false)
	private Long admissionId;

	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@Column(name = "doctor_id", nullable = false)
	private Long doctorId;

	@Column(name = "hospital_id")
	private Long hospitalId;

	@Temporal(TemporalType.TIMESTAMP)
	private Date dischargeDate;

	@Column(nullable = false)
	private String finalDiagnosis;

	@Column(columnDefinition = "TEXT")
	private String treatmentSummary;

	@Column(columnDefinition = "TEXT")
	private String dischargeMedications;

	@Column(columnDefinition = "TEXT")
	private String followUpInstructions;

	private String followUpDate;
	private String dischargeCondition;

	private String dischargeType;

	@Column(columnDefinition = "TEXT")
	private String specialInstructions;

	private Boolean doctorApproved = false;
	private Boolean billingCleared = false;
	private Boolean pharmacyClearance = false;

	private String summaryPdfUrl;
	private String status;
}