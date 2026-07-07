package codewithhimanshu.appointment.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "rn_resource")
public class Resource_t {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "resource_name", nullable = false, length = 200)
	private String resourceName;

	// DOCTOR, THERAPIST, BED, EQUIPMENT, ROOM
	@Column(name = "resource_type", length = 50)
	private String resourceType;

	@Column(name = "org_id")
	private Long orgId;

	@Column(name = "capacity")
	private Integer capacity = 1;

	@Column(name = "working_hours_start")
	private String workingHoursStart;

	@Column(name = "working_hours_end")
	private String workingHoursEnd;

	@JsonProperty("is_active")
	@Column(name = "is_active")
	private Boolean isActive = true;

	@Column(name = "account_id")
	private Long accountId;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;
}