package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "hosp_insurance_claim")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InsuranceClaimEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long claimId;

	@Column(name = "claim_number", unique = true)
	private String claimNumber;

	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@Column(name = "invoice_id")
	private Long invoiceId;

	@Column(name = "admission_id")
	private Long admissionId;

	@Column(name = "hospital_id")
	private Long hospitalId;

	@Column(nullable = false)
	private String policyNumber;

	@Column(nullable = false)
	private String insuranceProvider;

	private String tpaName;
	private String authorizationCode;

	@Temporal(TemporalType.DATE)
	@Column(nullable = false)
	private Date policyExpiry;

	private BigDecimal coverageAmount;
	private BigDecimal claimAmount;
	private BigDecimal approvedAmount;
	private BigDecimal settledAmount;

	private String claimStatus;

	@Temporal(TemporalType.TIMESTAMP)
	private Date claimSubmissionDate;

	@Temporal(TemporalType.TIMESTAMP)
	private Date settlementDate;

	@Column(columnDefinition = "TEXT")
	private String claimDocuments;

	@Column(columnDefinition = "TEXT")
	private String remarks;
}