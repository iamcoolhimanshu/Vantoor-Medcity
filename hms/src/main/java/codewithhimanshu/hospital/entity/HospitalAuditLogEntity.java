package codewithhimanshu.hospital.entity;

import lombok.*;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "hosp_audit_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalAuditLogEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long auditId;

	private Long accountId;
	private Long userId;
	private String userName;
	private String module;
	private String action;
	private String entityId;
	private String entityType;

	@Column(columnDefinition = "TEXT")
	private String oldValue;

	@Column(columnDefinition = "TEXT")
	private String newValue;

	@Temporal(TemporalType.TIMESTAMP)
	private Date actionTime;

	private String ipAddress;
	private String remarks;
}