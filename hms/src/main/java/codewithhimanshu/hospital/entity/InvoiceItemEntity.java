package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/**
 * Line-item breakdown for each invoice.
 * Per billing FRD database design: invoice_items table.
 * Allows itemised billing (e.g. each lab test, each medicine, each procedure as a row).
 */
@Entity
@Table(name = "hosp_invoice_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InvoiceItemEntity extends HospitalBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @NotNull(message = "Invoice ID is required")
    @Column(name = "invoice_id", nullable = false)
    private Long invoiceId;

    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "hospital_id")
    private Long hospitalId;

    /**
     * CONSULTATION, ROOM_RENT, NURSING, LAB_TEST, MEDICINE,
     * OT_CHARGE, EMERGENCY, PROCEDURE, CONSUMABLE, OTHER
     */
    @NotBlank(message = "Item category is required")
    @Column(nullable = false)
    private String itemCategory;

    @NotBlank(message = "Item name is required")
    @Column(nullable = false)
    private String itemName;

    private String itemDescription;

    /** Reference to the source record (lab test id, medicine id, etc.) */
    private Long sourceId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1)
    @Column(nullable = false)
    private Integer quantity = 1;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0")
    @Column(nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private BigDecimal totalPrice;

    private BigDecimal discountAmount = BigDecimal.ZERO;
    private BigDecimal gstPercent = BigDecimal.ZERO;
    private BigDecimal gstAmount = BigDecimal.ZERO;
    private BigDecimal netAmount;

    /** Calculated or manually entered */
    private Boolean isManual = false;
}
