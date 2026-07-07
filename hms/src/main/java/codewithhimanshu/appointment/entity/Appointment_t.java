package codewithhimanshu.appointment.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "rn_appointment")
public class Appointment_t {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "appointment_number", unique = true, length = 50)
	private String appointmentNumber;

	@Column(name = "customer_id")
	private Long customerId;

	@Column(name = "customer_name", length = 200)
	private String customerName;

	@Column(name = "customer_phone", length = 20)
	private String customerPhone;

	@Column(name = "customer_email", length = 200)
	private String customerEmail;

	@Column(name = "org_id")
	private Long orgId;

	@Column(name = "service_item_id")
	private Long serviceItemId;

	@Column(name = "service_name", length = 200)
	private String serviceName;

	@Column(name = "resource_id")
	private Long resourceId;

	@Column(name = "resource_name", length = 200)
	private String resourceName;

	@Column(name = "appointment_date")
	private LocalDate appointmentDate;

	@Column(name = "start_time")
	private LocalTime startTime;

	@Column(name = "end_time")
	private LocalTime endTime;

	@Column(name = "duration_minutes")
	private Integer durationMinutes;

	@Column(name = "status", length = 30)
	private String status = "SCHEDULED";

	@Column(name = "notes", length = 1000)
	private String notes;

	@Column(name = "visitor_message", length = 1000)
	private String visitorMessage;

	@Column(name = "account_id")
	private Long accountId;

	@Column(name = "booking_profile_id")
	private Long bookingProfileId;

	@Column(name = "timezone", length = 100)
	private String timezone;

	@Column(name = "booked_by_type", length = 30)
	private String bookedByType = "INTERNAL_USER";

	@Column(name = "source", length = 30)
	private String source = "INTERNAL_PANEL";

	@Column(name = "cancellation_reason", length = 500)
	private String cancellationReason;

	@Column(name = "cancelled_at")
	private LocalDateTime cancelledAt;

	@Column(name = "cancelled_by", length = 200)
	private String cancelledBy;

	@Column(name = "rescheduled_from_appointment_id")
	private Long rescheduledFromAppointmentId;

	@Column(name = "rescheduled_to_appointment_id")
	private Long rescheduledToAppointmentId;

	@Column(name = "hold_id", length = 100)
	private String holdId;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;
}
