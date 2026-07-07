package codewithhimanshu.appointment.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "rn_slot_hold")
public class SlotHold_t {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "hold_token", unique = true, nullable = false, length = 100)
	private String holdToken;

	@Column(name = "booking_profile_id", nullable = false)
	private Long bookingProfileId;

	@Column(name = "slot_date", nullable = false)
	private LocalDate slotDate;

	@Column(name = "slot_start", nullable = false)
	private LocalTime slotStart;

	@Column(name = "slot_end", nullable = false)
	private LocalTime slotEnd;

	@Column(name = "visitor_session", length = 200)
	private String visitorSession;

	@Column(name = "status", length = 20)
	private String status = "ACTIVE";

	@Column(name = "expires_at", nullable = false)
	private LocalDateTime expiresAt;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;
}
