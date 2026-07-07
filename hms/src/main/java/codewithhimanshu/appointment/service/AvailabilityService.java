package codewithhimanshu.appointment.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import codewithhimanshu.appointment.dto.AvailableSlotsResponse;
import codewithhimanshu.appointment.entity.BookingDateOverride_t;
import codewithhimanshu.appointment.entity.BookingProfile_t;
import codewithhimanshu.appointment.entity.BookingWorkingHours_t;
import codewithhimanshu.appointment.entity.SlotHold_t;
import codewithhimanshu.appointment.repository.Appointment_Repository;
import codewithhimanshu.appointment.repository.BookingDateOverrideRepository;
import codewithhimanshu.appointment.repository.BookingProfileRepository;
import codewithhimanshu.appointment.repository.BookingWorkingHoursRepository;
import codewithhimanshu.appointment.repository.SlotHoldRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AvailabilityService {

	@Autowired
	private BookingProfileRepository profileRepo;
	@Autowired
	private BookingWorkingHoursRepository workingHoursRepo;
	@Autowired
	private BookingDateOverrideRepository overrideRepo;
	@Autowired
	private SlotHoldRepository holdRepo;
	@Autowired
	private Appointment_Repository appointmentRepo;

	private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
	private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

	private ZoneId getProfileZone(BookingProfile_t profile) {
		if (profile.getTimezone() != null && !profile.getTimezone().isBlank()) {
			try {
				return ZoneId.of(profile.getTimezone());
			} catch (Exception ignored) {
			}
		}
		return IST;
	}

	private LocalTime parseTime(String s) {
		if (s == null || s.isBlank())
			return null;
		String t = s.trim().toUpperCase(java.util.Locale.ENGLISH);
		// Try 24hr first
		try {
			return LocalTime.parse(t, TIME_FMT);
		} catch (Exception ignored) {
		}
		// Try 12hr with space AM/PM
		try {
			return LocalTime.parse(t, DateTimeFormatter.ofPattern("hh:mm a", java.util.Locale.ENGLISH));
		} catch (Exception ignored) {
		}
		try {
			return LocalTime.parse(t, DateTimeFormatter.ofPattern("h:mm a", java.util.Locale.ENGLISH));
		} catch (Exception ignored) {
		}
		// Try ISO
		try {
			return LocalTime.parse(t);
		} catch (Exception ignored) {
		}
		return null;
	}

	// ── Safe defaults (used when DB column is NULL for old rows created before
	// these columns were added via ddl-auto=update) ─────────────────────────
	private static final int DEFAULT_DURATION = 30;
	private static final int DEFAULT_INTERVAL = 30;
	private static final int DEFAULT_MAX_SLOT = 1;
	private static final int DEFAULT_MIN_NOTICE = 0; // no minimum notice
	private static final String DEFAULT_START = "09:00";
	private static final String DEFAULT_END = "18:00";

	// ── Null-safe accessors ───────────────────────────────────────────────────

	private int duration(BookingProfile_t p) {
		return p.getMeetingDurationMinutes() != null ? p.getMeetingDurationMinutes() : DEFAULT_DURATION;
	}

	private int interval(BookingProfile_t p) {
		int v = p.getSlotIntervalMinutes() != null ? p.getSlotIntervalMinutes() : DEFAULT_INTERVAL;
		return v > 0 ? v : DEFAULT_INTERVAL; // guard against 0 to prevent infinite loop
	}

	private int maxPerSlot(BookingProfile_t p) {
		int v = p.getMaxBookingsPerSlot() != null ? p.getMaxBookingsPerSlot() : DEFAULT_MAX_SLOT;
		return v > 0 ? v : DEFAULT_MAX_SLOT;
	}

	private int minNotice(BookingProfile_t p) {
		return p.getMinNoticeMinutes() != null ? p.getMinNoticeMinutes() : DEFAULT_MIN_NOTICE;
	}

	public AvailableSlotsResponse getAvailableSlots(Long profileId, LocalDate date) {
		BookingProfile_t profile = profileRepo.findById(profileId)
				.orElseThrow(() -> new RuntimeException("Booking profile not found: " + profileId));

		ZoneId zone = getProfileZone(profile);

		AvailableSlotsResponse response = new AvailableSlotsResponse();
		response.setBookingProfileId(profileId);
		response.setProfileName(profile.getName());
		response.setDate(date);
		response.setTimezone(profile.getTimezone() != null ? profile.getTimezone() : "Asia/Kolkata");

		holdRepo.expireStaleHolds(LocalDateTime.now(zone));

		if (!isDateWithinBookingWindow(profile, date, zone)) {
			response.setSlots(new ArrayList<>());
			return response;
		}
		int dow = date.getDayOfWeek().getValue() % 7;

		Optional<BookingDateOverride_t> override = overrideRepo.findByBookingProfileIdAndOverrideDate(profileId, date);

		String startStr = null;
		String endStr = null;

		if (override.isPresent()) {
			BookingDateOverride_t ov = override.get();
			if (!Boolean.TRUE.equals(ov.getIsAvailable())) {
				response.setSlots(new ArrayList<>());
				return response;
			}
			startStr = ov.getStartTimeLocal();
			endStr = ov.getEndTimeLocal();
		} else {
			List<BookingWorkingHours_t> hours = workingHoursRepo.findByBookingProfileIdOrderByDayOfWeek(profileId);

			if (hours == null || hours.isEmpty()) {
				// ── FALLBACK: no working hours rows yet → Mon–Fri 09:00–18:00 ──
				if (dow >= 1 && dow <= 5) {
					startStr = DEFAULT_START;
					endStr = DEFAULT_END;
				}
			} else {
				for (BookingWorkingHours_t h : hours) {
					if (h.getDayOfWeek() == dow && Boolean.TRUE.equals(h.getIsWorkingDay())) {
						startStr = h.getStartTimeLocal();
						endStr = h.getEndTimeLocal();
						break;
					}
				}
			}
		}

		if (startStr == null || endStr == null) {
			response.setSlots(new ArrayList<>());
			return response;
		}

		LocalTime windowStart = parseTime(startStr);
		LocalTime windowEnd = parseTime(endStr);

		// If time strings are unparseable (bad data in DB), fall back to defaults
		if (windowStart == null || windowEnd == null) {
			windowStart = LocalTime.parse(DEFAULT_START, TIME_FMT);
			windowEnd = LocalTime.parse(DEFAULT_END, TIME_FMT);
		}

		int dur = duration(profile);
		int step = interval(profile);
		int maxSlot = maxPerSlot(profile);
		// FIX: use profile timezone for "now" so minNotice works correctly on server
		LocalTime nowInZone = LocalTime.now(zone);
		LocalTime minNoticeTime = nowInZone.plusMinutes(minNotice(profile));
		LocalDate todayInZone = LocalDate.now(zone);

		Integer maxPerDay = profile.getMaxBookingsPerDay();
		long dayBookings = 0;
		try {
			dayBookings = appointmentRepo.countActiveBookingsForDay(profileId, date);
		} catch (Exception ignored) {
		}

		List<AvailableSlotsResponse.SlotDto> slots = new ArrayList<>();
		LocalTime cursor = windowStart;

		while (!cursor.plusMinutes(dur).isAfter(windowEnd)) {
			LocalTime slotEnd = cursor.plusMinutes(dur);

			long booked = 0;
			try {
				booked = appointmentRepo.countActiveBookingsForSlot(profileId, date, cursor);
			} catch (Exception ignored) {
			}

			List<SlotHold_t> activeHolds = holdRepo.findByBookingProfileIdAndSlotDateAndSlotStartAndStatus(profileId,
					date, cursor, "ACTIVE");
			long heldCount = activeHolds.size();

			int remaining = (int) (maxSlot - booked - heldCount);
			// FIX: compare date against today in profile timezone
			boolean pastNotice = date.equals(todayInZone) && cursor.isBefore(minNoticeTime);
			boolean dayCapReached = maxPerDay != null && dayBookings >= maxPerDay;

			AvailableSlotsResponse.SlotDto slot = new AvailableSlotsResponse.SlotDto();
			slot.setStartTime(cursor.format(TIME_FMT));
			slot.setEndTime(slotEnd.format(TIME_FMT));
			slot.setRemainingCapacity(Math.max(0, remaining));
			slot.setAvailable(remaining > 0 && !pastNotice && !dayCapReached);
			slots.add(slot);

			cursor = cursor.plusMinutes(step);
		}

		response.setSlots(slots);
		return response;
	}

	public List<LocalDate> getAvailableDates(Long profileId, LocalDate from, LocalDate to) {
		BookingProfile_t profile = profileRepo.findById(profileId)
				.orElseThrow(() -> new RuntimeException("Booking profile not found: " + profileId));

		ZoneId zone = getProfileZone(profile);

		// ── Bulk fetch all data once (instead of per-day DB hits) ──────────
		List<BookingWorkingHours_t> allHours = workingHoursRepo.findByBookingProfileIdOrderByDayOfWeek(profileId);
		List<BookingDateOverride_t> allOverrides = overrideRepo.findByBookingProfileId(profileId);

		// Build lookup maps
		java.util.Map<Integer, BookingWorkingHours_t> hoursByDow = new java.util.HashMap<>();
		for (BookingWorkingHours_t h : allHours) {
			if (Boolean.TRUE.equals(h.getIsWorkingDay())) {
				hoursByDow.put(h.getDayOfWeek(), h);
			}
		}
		java.util.Map<LocalDate, BookingDateOverride_t> overrideByDate = new java.util.HashMap<>();
		for (BookingDateOverride_t ov : allOverrides) {
			overrideByDate.put(ov.getOverrideDate(), ov);
		}

		int dur = duration(profile);
		int step = interval(profile);
		int maxSlot = maxPerSlot(profile);
		int minNoticeMin = minNotice(profile);
		Integer maxPerDay = profile.getMaxBookingsPerDay();

		// FIX: use profile timezone for stale hold expiry
		holdRepo.expireStaleHolds(LocalDateTime.now(zone));

		// FIX: today in profile timezone
		LocalDate todayInZone = LocalDate.now(zone);
		LocalTime nowInZone = LocalTime.now(zone);

		List<LocalDate> availableDates = new ArrayList<>();
		LocalDate cursor = from;

		while (!cursor.isAfter(to)) {
			try {
				if (!isDateWithinBookingWindow(profile, cursor, zone)) {
					cursor = cursor.plusDays(1);
					continue;
				}

				// int dow: 0=Sun,1=Mon,...,6=Sat
				int dow = cursor.getDayOfWeek().getValue() % 7;

				String startStr = null;
				String endStr = null;

				BookingDateOverride_t ov = overrideByDate.get(cursor);
				if (ov != null) {
					if (!Boolean.TRUE.equals(ov.getIsAvailable())) {
						cursor = cursor.plusDays(1);
						continue;
					}
					startStr = ov.getStartTimeLocal();
					endStr = ov.getEndTimeLocal();
				} else if (!allHours.isEmpty()) {
					BookingWorkingHours_t h = hoursByDow.get(dow);
					if (h != null) {
						startStr = h.getStartTimeLocal();
						endStr = h.getEndTimeLocal();
					}
				} else {
					// fallback Mon-Fri
					if (dow >= 1 && dow <= 5) {
						startStr = DEFAULT_START;
						endStr = DEFAULT_END;
					}
				}

				if (startStr == null || endStr == null) {
					cursor = cursor.plusDays(1);
					continue;
				}

				LocalTime windowStart = parseTime(startStr);
				LocalTime windowEnd = parseTime(endStr);
				if (windowStart == null || windowEnd == null) {
					cursor = cursor.plusDays(1);
					continue;
				}

				// Check day capacity once per day (single DB call only for candidate dates)
				long dayBookings = 0;
				try {
					dayBookings = appointmentRepo.countActiveBookingsForDay(profileId, cursor);
				} catch (Exception ignored) {
				}

				if (maxPerDay != null && dayBookings >= maxPerDay) {
					cursor = cursor.plusDays(1);
					continue;
				}

				// FIX: use profile timezone for minNotice comparison
				LocalTime minNoticeTime = cursor.equals(todayInZone) ? nowInZone.plusMinutes(minNoticeMin) : null;

				// Check if at least one slot is available
				LocalTime slotCursor = windowStart;
				boolean hasAvailableSlot = false;
				while (!slotCursor.plusMinutes(dur).isAfter(windowEnd)) {
					if (minNoticeTime != null && slotCursor.isBefore(minNoticeTime)) {
						slotCursor = slotCursor.plusMinutes(step);
						continue;
					}
					long booked = 0;
					try {
						booked = appointmentRepo.countActiveBookingsForSlot(profileId, cursor, slotCursor);
					} catch (Exception ignored) {
					}

					long held = holdRepo.findByBookingProfileIdAndSlotDateAndSlotStartAndStatus(profileId, cursor,
							slotCursor, "ACTIVE").size();

					if ((int) (maxSlot - booked - held) > 0) {
						hasAvailableSlot = true;
						break; // found one available slot, no need to check more
					}
					slotCursor = slotCursor.plusMinutes(step);
				}

				if (hasAvailableSlot)
					availableDates.add(cursor);
			} catch (Exception ignored) {
			}

			cursor = cursor.plusDays(1);
		}
		return availableDates;
	}

	private boolean isDateWithinBookingWindow(BookingProfile_t profile, LocalDate date, ZoneId zone) {
		LocalDate today = LocalDate.now(zone);
		if (date.isBefore(today))
			return false;

		if (profile.getBookingWindowType() == null || "ROLLING".equals(profile.getBookingWindowType())) {
			int days = profile.getBookingWindowDays() != null ? profile.getBookingWindowDays() : 30;
			return !date.isAfter(today.plusDays(days));
		}
		return true;
	}

	private boolean isDateWithinBookingWindow(BookingProfile_t profile, LocalDate date) {
		return isDateWithinBookingWindow(profile, date, getProfileZone(profile));
	}
}