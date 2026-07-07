package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "hosp_medicine_inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class MedicineInventoryEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long medicineId;

	@NotBlank(message = "Medicine name is required")
	@Column(nullable = false)
	private String medicineName;

	private String genericName;
	private String medicineCategory;
	private String manufacturer;

	@NotBlank(message = "Batch number is required")
	@Column(name = "batch_number", nullable = false)
	private String batchNumber;

	@Temporal(TemporalType.DATE)
	@Column(nullable = false)
	private Date expiryDate;

	@NotNull(message = "Quantity is required")
	@Min(value = 0, message = "Quantity cannot be negative")
	@Column(nullable = false)
	private Integer quantity;

	private Integer lowStockAlertLevel = 10;
	private String unit;

	@DecimalMin(value = "0.0")
	private BigDecimal purchasePrice;

	@DecimalMin(value = "0.0")
	private BigDecimal sellingPrice;

	@Column(name = "hospital_id")
	private Long hospitalId;

	private String supplier;
	private String storageLocation;
	private Boolean isExpired = false;
	private Boolean isActive = true;
}