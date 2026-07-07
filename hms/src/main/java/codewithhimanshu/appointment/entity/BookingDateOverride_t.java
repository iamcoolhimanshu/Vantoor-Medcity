package codewithhimanshu.appointment.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "rn_booking_date_override")
public class BookingDateOverride_t {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "booking_profile_id", nullable = false)
	private Long bookingProfileId;

	@Column(name = "override_date", nullable = false)
	private LocalDate overrideDate;

	@Column(name = "is_available")
	private Boolean isAvailable = false;

	@Column(name = "start_time_local", length = 10)
	private String startTimeLocal;

	@Column(name = "end_time_local", length = 10)
	private String endTimeLocal;

	@Column(name = "reason", length = 500)
	private String reason;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;
}
