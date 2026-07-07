package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.List;

@Entity
@Table(name = "hosp_hospital")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class HospitalEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long hospitalId;

	@NotBlank(message = "Hospital name is required")
	@Size(min = 3, message = "Hospital name must be at least 3 characters")
	@Column(nullable = false)
	private String hospitalName;

	@NotBlank(message = "Registration number is required")
	@Column(unique = true, nullable = false)
	private String registrationNumber;

	private String address;
	private String city;
	private String state;
	private String pincode;
	private String email;

	@Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits")
	private String phone;

	private String website;
	private String hospitalType;
	private String logoUrl;
	private String description;
	private Integer totalBeds;
}