package codewithhimanshu.appointment.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import codewithhimanshu.appointment.dto.PublicBookingRequest;
import codewithhimanshu.appointment.dto.RescheduleRequest;
import codewithhimanshu.appointment.entity.Appointment_t;
import codewithhimanshu.appointment.entity.BookingProfile_t;
import codewithhimanshu.appointment.entity.SlotHold_t;
import codewithhimanshu.appointment.repository.Appointment_Repository;
import codewithhimanshu.appointment.repository.BookingProfileRepository;
import jakarta.transaction.Transactional;

@Service
public class CalendlyAppointmentService {

	private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

	@Autowired
	private Appointment_Repository appointmentRepo;
	@Autowired
	private BookingProfileRepository profileRepo;
	@Autowired
	private SlotHoldService holdService;
	@Autowired
	private AvailabilityService availabilityService;

	@Transactional
	public Appointment_t confirmPublicBooking(PublicBookingRequest req) {
		// 1. Confirm hold (validates still active + not expired)
		holdService.confirmHold(req.getHoldToken());
		SlotHold_t hold = holdService.getByToken(req.getHoldToken());

		// 2. Load profile
		BookingProfile_t profile = profileRepo.findById(hold.getBookingProfileId())
				.orElseThrow(() -> new RuntimeException("Booking profile not found"));

		// 3. Final capacity check
		long booked = appointmentRepo.countActiveBookingsForSlot(hold.getBookingProfileId(), hold.getSlotDate(),
				hold.getSlotStart());
		if (booked >= profile.getMaxBookingsPerSlot()) {
			throw new RuntimeException("Slot capacity has been reached. Please choose another time.");
		}

		// 4. Create appointment
		Appointment_t appt = new Appointment_t();
		appt.setBookingProfileId(hold.getBookingProfileId());
		appt.setAppointmentDate(hold.getSlotDate());
		appt.setStartTime(hold.getSlotStart());
		appt.setEndTime(hold.getSlotEnd());
		appt.setDurationMinutes(profile.getMeetingDurationMinutes());
		appt.setServiceName(profile.getServiceName());
		appt.setServiceItemId(profile.getServiceItemId());
		appt.setResourceId(profile.getResourceId());
		appt.setResourceName(profile.getResourceName());
		appt.setAccountId(profile.getAccountId());
		appt.setCustomerName(req.getCustomerName());
		appt.setCustomerEmail(req.getCustomerEmail());
		appt.setCustomerPhone(req.getCustomerPhone());
		appt.setVisitorMessage(req.getVisitorMessage());
		appt.setTimezone(req.getTimezone() != null ? req.getTimezone() : profile.getTimezone());
		appt.setBookedByType("VISITOR");
		appt.setSource("PUBLIC_LINK");
		appt.setHoldId(req.getHoldToken());
		appt.setStatus("AUTO".equals(profile.getConfirmationType()) ? "CONFIRMED" : "PENDING_APPROVAL");
		appt.setAppointmentNumber(generateAppointmentNumber());

		return appointmentRepo.save(appt);
	}

	/**
	 * Internal booking (no hold required).
	 */
	@Transactional
	public Appointment_t bookInternal(Appointment_t appt) {
		appt.setStatus("SCHEDULED");
		appt.setBookedByType("INTERNAL_USER");
		appt.setSource("INTERNAL_PANEL");
		appt.setAppointmentNumber(generateAppointmentNumber());
		return appointmentRepo.save(appt);
	}

	/**
	 * Cancel an appointment.
	 */
	@Transactional
	public Appointment_t cancel(Long id, String reason, String cancelledBy) {
		Appointment_t appt = appointmentRepo.findById(id)
				.orElseThrow(() -> new RuntimeException("Appointment not found: " + id));
		if ("CANCELLED".equals(appt.getStatus())) {
			throw new RuntimeException("Appointment is already cancelled.");
		}
		appt.setStatus("CANCELLED");
		appt.setCancellationReason(reason);
		appt.setCancelledAt(LocalDateTime.now());
		appt.setCancelledBy(cancelledBy);
		return appointmentRepo.save(appt);
	}

	/**
	 * Reschedule an appointment to a new slot.
	 */
	@Transactional
	public Appointment_t reschedule(Long id, RescheduleRequest req) {
		Appointment_t old = appointmentRepo.findById(id)
				.orElseThrow(() -> new RuntimeException("Appointment not found: " + id));
		if ("CANCELLED".equals(old.getStatus())) {
			throw new RuntimeException("Cannot reschedule a cancelled appointment.");
		}

		LocalDate newDate = LocalDate.parse(req.getNewDate(), DATE_FMT);
		LocalTime newStart = LocalTime.parse(req.getNewStart(), TIME_FMT);

		// Load profile to get duration
		BookingProfile_t profile = null;
		if (old.getBookingProfileId() != null) {
			profile = profileRepo.findById(old.getBookingProfileId()).orElse(null);
		}
		int dur = profile != null ? profile.getMeetingDurationMinutes()
				: (old.getDurationMinutes() != null ? old.getDurationMinutes() : 30);
		LocalTime newEnd = newStart.plusMinutes(dur);

		// Check capacity on new slot
		if (old.getBookingProfileId() != null) {
			long booked = appointmentRepo.countActiveBookingsForSlot(old.getBookingProfileId(), newDate, newStart);
			int cap = profile != null ? profile.getMaxBookingsPerSlot() : 1;
			if (booked >= cap) {
				throw new RuntimeException("New slot is fully booked. Please choose another time.");
			}
		}

		// Cancel old
		old.setStatus("CANCELLED");
		old.setCancellationReason("Rescheduled: " + req.getReason());
		old.setCancelledAt(LocalDateTime.now());
		appointmentRepo.save(old);

		// Create new
		Appointment_t newAppt = new Appointment_t();
		newAppt.setBookingProfileId(old.getBookingProfileId());
		newAppt.setCustomerId(old.getCustomerId());
		newAppt.setCustomerName(old.getCustomerName());
		newAppt.setCustomerPhone(old.getCustomerPhone());
		newAppt.setCustomerEmail(old.getCustomerEmail());
		newAppt.setServiceItemId(old.getServiceItemId());
		newAppt.setServiceName(old.getServiceName());
		newAppt.setResourceId(old.getResourceId());
		newAppt.setResourceName(old.getResourceName());
		newAppt.setAccountId(old.getAccountId());
		newAppt.setAppointmentDate(newDate);
		newAppt.setStartTime(newStart);
		newAppt.setEndTime(newEnd);
		newAppt.setDurationMinutes(dur);
		newAppt.setNotes(old.getNotes());
		newAppt.setTimezone(old.getTimezone());
		newAppt.setBookedByType(old.getBookedByType());
		newAppt.setSource(old.getSource());
		newAppt.setStatus("SCHEDULED");
		newAppt.setRescheduledFromAppointmentId(old.getId());
		newAppt.setAppointmentNumber(generateAppointmentNumber());

		Appointment_t saved = appointmentRepo.save(newAppt);

		old.setRescheduledToAppointmentId(saved.getId());
		appointmentRepo.save(old);

		return saved;
	}

	private String generateAppointmentNumber() {
		String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
		return "APT-" + ts;
	}
}
