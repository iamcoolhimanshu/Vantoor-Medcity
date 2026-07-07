package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "hosp_ward")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class WardEntity extends HospitalBaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long wardId;

	@NotNull
	@Column(name = "hospital_id", nullable = false)
	private Long hospitalId;

	@NotBlank(message = "Ward name is required")
	@Column(nullable = false)
	private String wardName;

	private String wardType;
	private Integer totalBeds;
	private Integer availableBeds;
	private String floor;
	private String description;
	private String status;
}