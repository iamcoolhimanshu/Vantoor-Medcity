package codewithhimanshu.appointment.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "rn_booking_working_hours")
public class BookingWorkingHours_t {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "booking_profile_id", nullable = false)
	private Long bookingProfileId;

	@Column(name = "day_of_week")
	private Integer dayOfWeek;

	@Column(name = "is_working_day")
	private Boolean isWorkingDay = true;

	@Column(name = "start_time_local", length = 10)
	private String startTimeLocal;

	@Column(name = "end_time_local", length = 10)
	private String endTimeLocal;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;
}
