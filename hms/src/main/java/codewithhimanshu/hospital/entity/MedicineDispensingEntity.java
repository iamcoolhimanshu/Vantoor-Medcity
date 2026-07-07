package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "hosp_medicine_dispensing")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class MedicineDispensingEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long dispensingId;

	@Column(name = "prescription_id")
	private Long prescriptionId;

	@Column(name = "patient_id", nullable = false)
	private Long patientId;

	@Column(name = "medicine_id", nullable = false)
	private Long medicineId;

	private String medicineName;
	private Integer quantityDispensed;
	private BigDecimal totalAmount;

	@Temporal(TemporalType.TIMESTAMP)
	private Date dispensedDate;

	private String dispensedBy;
	private String status;

	@Column(name = "hospital_id")
	private Long hospitalId;
}