package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Date;

/**
 * Manages refund requests and processing.
 * Per billing FRD: refunds table; Refund workflow, Refund requests require
 * authorization, Refund transactions immutable after processing.
 */
@Entity
@Table(name = "hosp_refund")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RefundEntity extends HospitalBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long refundId;

    @Column(name = "refund_reference", unique = true)
    private String refundReference;

    @NotNull(message = "Patient ID is required")
    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(name = "payment_id")
    private Long paymentId;

    /** Can also be linked to an advance payment */
    @Column(name = "advance_id")
    private Long advanceId;

    @Column(name = "hospital_id")
    private Long hospitalId;

    @NotNull(message = "Refund amount is required")
    @DecimalMin(value = "0.01", message = "Refund amount must be greater than 0")
    @Column(nullable = false)
    private BigDecimal refundAmount;

    @NotBlank(message = "Refund reason is mandatory")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String refundReason;

    /** CASH, BANK_TRANSFER, UPI, ORIGINAL_PAYMENT_MODE */
    private String refundMode;

    private String transactionId;

    @Temporal(TemporalType.TIMESTAMP)
    private Date requestedDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Date processedDate;

    private String requestedBy;
    private String approvedBy;

    /** PENDING_APPROVAL, APPROVED, REJECTED, PROCESSED */
    private String refundStatus;

    @Column(columnDefinition = "TEXT")
    private String approvalRemarks;

    /** Once processed this flag prevents re-processing (immutable rule) */
    private Boolean isProcessed = false;
}
