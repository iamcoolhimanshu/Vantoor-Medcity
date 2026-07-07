package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@Entity
@Table(name = "hosp_doctor")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class DoctorEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long doctorId;

	@NotBlank(message = "Doctor name is required")
	@Size(min = 3, message = "Doctor name must be at least 3 characters")
	@Column(nullable = false)
	private String doctorName;

	@NotBlank(message = "Mobile number is required")
	@Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be exactly 10 digits")
	@Column(unique = true, nullable = false)
	private String mobileNumber;

	private String email;

	@NotBlank(message = "Specialization is required")
	@Column(nullable = false)
	private String specialization;

	@NotNull(message = "Consultation fees are required")
	@DecimalMin(value = "0.01", message = "Fees must be greater than 0")
	@Column(nullable = false)
	private BigDecimal consultationFees;

	private String qualification;
	private String licenseNumber;
	private String address;

	@Column(name = "hospital_id")
	private Long hospitalId;

	@Column(name = "dept_id")
	private Long deptId;

	private String gender;
	private String experience;
	private String status;
	private String profileImageUrl;

	private String availabilityDays;
	private String availableFrom;
	private String availableTo;
}