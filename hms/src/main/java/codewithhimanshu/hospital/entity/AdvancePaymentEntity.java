package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Date;

/**
 * Tracks advance/deposit payments collected before or during admission.
 * Per billing FRD: advance_payments table, Admission deposit collection,
 * Advance adjustment in final bill, Refundable deposits require approval.
 */
@Entity
@Table(name = "hosp_advance_payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AdvancePaymentEntity extends HospitalBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long advanceId;

    @Column(name = "advance_reference", unique = true)
    private String advanceReference;

    @NotNull(message = "Patient ID is required")
    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "admission_id")
    private Long admissionId;

    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(name = "hospital_id")
    private Long hospitalId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Column(nullable = false)
    private BigDecimal amount;

    /** ADMISSION_DEPOSIT, SECURITY_DEPOSIT, PARTIAL_ADVANCE */
    @NotBlank(message = "Advance type is required")
    @Column(nullable = false)
    private String advanceType;

    /** CASH, CARD, UPI, WALLET, NET_BANKING */
    @NotBlank(message = "Payment mode is required")
    @Column(nullable = false)
    private String paymentMode;

    private String transactionId;

    @Temporal(TemporalType.TIMESTAMP)
    private Date paymentDate;

    private String receiptNumber;
    private String collectedBy;

    /** COLLECTED, ADJUSTED, REFUNDED, PARTIALLY_ADJUSTED */
    private String advanceStatus;

    /** Amount already adjusted against final billing */
    private BigDecimal adjustedAmount = BigDecimal.ZERO;

    /** Remaining unadjusted balance */
    private BigDecimal balanceAmount = BigDecimal.ZERO;

    private Boolean isRefundable = true;
    private Boolean refundApproved = false;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
