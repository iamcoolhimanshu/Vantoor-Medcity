package codewithhimanshu.appointment.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "rn_booking_profile")
public class BookingProfile_t {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "org_id")
	private Long orgId;

	@Column(name = "account_id")
	private Long accountId;

	@Column(name = "host_user_id")
	private Long hostUserId;

	@Column(name = "name", nullable = false, length = 200)
	private String name;

	@Column(name = "slug", unique = true, length = 100)
	private String slug;

	@Column(name = "description", length = 1000)
	private String description;

	@Column(name = "meeting_duration_minutes")
	private Integer meetingDurationMinutes = 30;

	@Column(name = "slot_interval_minutes")
	private Integer slotIntervalMinutes = 30;

	@Column(name = "max_bookings_per_slot")
	private Integer maxBookingsPerSlot = 1;

	// ROLLING or DATE_RANGE
	@Column(name = "booking_window_type", length = 20)
	private String bookingWindowType = "ROLLING";

	@Column(name = "booking_window_days")
	private Integer bookingWindowDays = 30;

	@Column(name = "min_notice_minutes")
	private Integer minNoticeMinutes = 60;

	@Column(name = "buffer_before_minutes")
	private Integer bufferBeforeMinutes = 0;

	@Column(name = "buffer_after_minutes")
	private Integer bufferAfterMinutes = 0;

	@Column(name = "max_bookings_per_day")
	private Integer maxBookingsPerDay;

	@Column(name = "timezone", length = 100)
	private String timezone = "Asia/Kolkata";

	@Column(name = "visibility", length = 20)
	private String visibility = "PUBLIC";

	@Column(name = "is_active")
	private Boolean isActive = true;

	@Column(name = "cancel_allowed")
	private Boolean cancelAllowed = true;

	@Column(name = "reschedule_allowed")
	private Boolean rescheduleAllowed = true;

	@Column(name = "collect_name")
	private Boolean collectName = true;

	@Column(name = "collect_email")
	private Boolean collectEmail = true;

	@Column(name = "collect_phone")
	private Boolean collectPhone = true;

	@Column(name = "collect_notes")
	private Boolean collectNotes = true;

	@Column(name = "confirmation_type", length = 20)
	private String confirmationType = "AUTO";

	@Column(name = "service_item_id")
	private Long serviceItemId;

	@Column(name = "service_name", length = 200)
	private String serviceName;

	@Column(name = "resource_id")
	private Long resourceId;

	@Column(name = "resource_name", length = 200)
	private String resourceName;

	@Column(name = "created_by", length = 200)
	private String createdBy;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;
}
