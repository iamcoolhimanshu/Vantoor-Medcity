package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "hosp_payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class HospitalPaymentEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long paymentId;

	@Column(name = "payment_reference", unique = true)
	private String paymentReference;

	@Column(name = "invoice_id", nullable = false)
	private Long invoiceId;

	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@Column(name = "hospital_id")
	private Long hospitalId;

	@Column(nullable = false)
	private BigDecimal amount;

	@Column(nullable = false)
	private String paymentMode;

	private String transactionId;
	private String upiId;
	private String cardLastFour;

	@Temporal(TemporalType.TIMESTAMP)
	private Date paymentDate;

	private String paymentStatus;
	private String paymentType;

	@Column(columnDefinition = "TEXT")
	private String notes;

	private String collectedBy;
	private String receiptNumber;
}