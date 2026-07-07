package codewithhimanshu.appointment.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import codewithhimanshu.appointment.dto.SlotHoldRequest;
import codewithhimanshu.appointment.entity.BookingProfile_t;
import codewithhimanshu.appointment.entity.SlotHold_t;
import codewithhimanshu.appointment.repository.Appointment_Repository;
import codewithhimanshu.appointment.repository.BookingProfileRepository;
import codewithhimanshu.appointment.repository.SlotHoldRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class SlotHoldService {

	private static final int HOLD_TTL_MINUTES = 15;
	private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
	private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

	@Autowired
	private SlotHoldRepository holdRepo;
	@Autowired
	private BookingProfileRepository profileRepo;
	@Autowired
	private Appointment_Repository appointmentRepo;

	@Transactional
	public SlotHold_t placeHold(SlotHoldRequest req) {
		LocalDateTime nowIst = LocalDateTime.now(IST);
		holdRepo.expireStaleHolds(nowIst);

		BookingProfile_t profile = profileRepo.findById(req.getBookingProfileId())
				.orElseThrow(() -> new RuntimeException("Booking profile not found"));

		// Use profile timezone if set, otherwise IST
		ZoneId profileZone = getProfileZone(profile);
		LocalDateTime nowProfile = LocalDateTime.now(profileZone);

		LocalDate slotDate = LocalDate.parse(req.getSlotDate(), DATE_FMT);
		LocalTime slotStart = LocalTime.parse(req.getSlotStart(), TIME_FMT);
		LocalTime slotEnd = slotStart.plusMinutes(profile.getMeetingDurationMinutes());

		// Count existing confirmed bookings
		long booked = appointmentRepo.countActiveBookingsForSlot(req.getBookingProfileId(), slotDate, slotStart);

		// Count active holds
		long held = holdRepo.findByBookingProfileIdAndSlotDateAndSlotStartAndStatus(req.getBookingProfileId(), slotDate,
				slotStart, "ACTIVE").size();

		int capacity = profile.getMaxBookingsPerSlot();
		if (booked + held >= capacity) {
			throw new RuntimeException("Slot is fully booked or held. Please choose another time.");
		}

		SlotHold_t hold = new SlotHold_t();
		hold.setHoldToken(UUID.randomUUID().toString());
		hold.setBookingProfileId(req.getBookingProfileId());
		hold.setSlotDate(slotDate);
		hold.setSlotStart(slotStart);
		hold.setSlotEnd(slotEnd);
		hold.setVisitorSession(req.getVisitorSession());
		hold.setStatus("ACTIVE");
		hold.setExpiresAt(nowProfile.plusMinutes(HOLD_TTL_MINUTES));

		return holdRepo.save(hold);
	}

	public SlotHold_t getByToken(String token) {
		return holdRepo.findByHoldToken(token).orElseThrow(() -> new RuntimeException("Hold not found or expired"));
	}

	@Transactional
	public void confirmHold(String token) {
		SlotHold_t hold = getByToken(token);
		if (!"ACTIVE".equals(hold.getStatus())) {
			throw new RuntimeException("Hold is no longer active. Please re-select the slot.");
		}
		// Compare using the same profile-aware timezone
		BookingProfile_t profile = profileRepo.findById(hold.getBookingProfileId()).orElse(null);
		ZoneId zone = (profile != null) ? getProfileZone(profile) : IST;
		LocalDateTime nowZone = LocalDateTime.now(zone);

		if (hold.getExpiresAt().isBefore(nowZone)) {
			hold.setStatus("EXPIRED");
			holdRepo.save(hold);
			throw new RuntimeException("Hold has expired. Please re-select the slot.");
		}
		hold.setStatus("CONFIRMED");
		holdRepo.save(hold);
	}

	// Runs every 2 minutes to clean expired holds
	@Scheduled(fixedDelay = 120000)
	@Transactional
	public void cleanExpiredHolds() {
		// Use IST as the reference clock for cleanup
		int count = holdRepo.expireStaleHolds(LocalDateTime.now(IST));
		if (count > 0) {
			System.out.println("[SlotHoldService] Expired " + count + " stale holds");
		}
	}

	private ZoneId getProfileZone(BookingProfile_t profile) {
		if (profile.getTimezone() != null && !profile.getTimezone().isBlank()) {
			try {
				return ZoneId.of(profile.getTimezone());
			} catch (Exception ignored) {
			}
		}
		return IST;
	}
}