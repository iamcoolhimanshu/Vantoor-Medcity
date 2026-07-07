package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "hosp_invoice")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class HospitalInvoiceEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long invoiceId;

	@Column(name = "invoice_number", unique = true)
	private String invoiceNumber;

	@NotNull
	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@Column(name = "hospital_id")
	private Long hospitalId;

	@Column(name = "admission_id")
	private Long admissionId;

	@Column(name = "consultation_id")
	private Long consultationId;

	@NotBlank(message = "Billing category is required")
	private String billingCategory;

	@Temporal(TemporalType.TIMESTAMP)
	private Date invoiceDate;

	private BigDecimal consultationCharges = BigDecimal.ZERO;
	private BigDecimal roomCharges = BigDecimal.ZERO;
	private BigDecimal nursingCharges = BigDecimal.ZERO;
	private BigDecimal labCharges = BigDecimal.ZERO;
	private BigDecimal pharmacyCharges = BigDecimal.ZERO;
	private BigDecimal otCharges = BigDecimal.ZERO;
	private BigDecimal emergencyCharges = BigDecimal.ZERO;
	private BigDecimal otherCharges = BigDecimal.ZERO;

	private BigDecimal subtotal = BigDecimal.ZERO;
	private BigDecimal discountAmount = BigDecimal.ZERO;
	private BigDecimal discountPercent = BigDecimal.ZERO;
	private String discountReason;

	private BigDecimal gstPercent = BigDecimal.ZERO;
	private BigDecimal gstAmount = BigDecimal.ZERO;
	private BigDecimal totalAmount = BigDecimal.ZERO;

	private BigDecimal advancePaid = BigDecimal.ZERO;
	private BigDecimal insuranceDeduction = BigDecimal.ZERO;
	private BigDecimal paidAmount = BigDecimal.ZERO;
	private BigDecimal pendingAmount = BigDecimal.ZERO;

	private String insurancePolicyNumber;
	private String insuranceProvider;
	private String insuranceAuthCode;

	private String invoiceStatus;
	private String paymentStatus;

	@Column(columnDefinition = "TEXT")
	private String notes;

	private Boolean isFinal = false;
}