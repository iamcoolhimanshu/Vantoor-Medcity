package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.Date;

@Entity
@Table(name = "hosp_patient")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PatientEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long patientId;

	// UHID - unique patient identifier
	@Column(name = "uhid", unique = true)
	private String uhid;

	@NotBlank(message = "Patient name is required")
	@Size(min = 3, message = "Patient name must be at least 3 characters")
	@Column(nullable = false)
	private String patientName;

	@NotBlank(message = "Mobile number is required")
	@Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be exactly 10 digits")
	@Column(unique = true, nullable = false)
	private String mobileNumber;

	private String email;

	@NotBlank(message = "Address is required")
	@Column(nullable = false)
	private String address;

	@Size(max = 500, message = "Problem description cannot exceed 500 characters")
	private String problem;

	private String gender;

	@Temporal(TemporalType.DATE)
	private Date dateOfBirth;

	private Integer age;
	private String bloodGroup;
	private String emergencyContact;
	private String emergencyContactName;
	private String allergies;
	private String medicalHistory;
	private String insurancePolicyNumber;
	private String insuranceProvider;
	private String patientType; // OPD, IPD
	private String status; // ACTIVE, INACTIVE
}