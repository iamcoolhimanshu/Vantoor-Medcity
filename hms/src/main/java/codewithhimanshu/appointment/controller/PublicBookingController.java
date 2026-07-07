package codewithhimanshu.appointment.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import codewithhimanshu.appointment.dto.AvailableSlotsResponse;
import codewithhimanshu.appointment.dto.PublicBookingRequest;
import codewithhimanshu.appointment.dto.SlotHoldRequest;
import codewithhimanshu.appointment.entity.Appointment_t;
import codewithhimanshu.appointment.entity.BookingProfile_t;
import codewithhimanshu.appointment.entity.SlotHold_t;
import codewithhimanshu.appointment.service.AvailabilityService;
import codewithhimanshu.appointment.service.BookingProfileService;
import codewithhimanshu.appointment.service.CalendlyAppointmentService;
import codewithhimanshu.appointment.service.SlotHoldService;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/public/book")
public class PublicBookingController {

	@Autowired
	private BookingProfileService profileService;
	@Autowired
	private AvailabilityService availabilityService;
	@Autowired
	private SlotHoldService holdService;
	@Autowired
	private CalendlyAppointmentService appointmentService;

	@GetMapping("/{slug}")
	public ResponseEntity<?> getProfile(@PathVariable String slug) {
		try {
			BookingProfile_t profile = profileService.getBySlug(slug);

			// treat null as active (backward-compat for rows created before column existed)
			if (Boolean.FALSE.equals(profile.getIsActive())) {
				return ResponseEntity.status(404).body(Map.of("error", "This booking link is currently inactive."));
			}

			// Use HashMap — Map.of() only supports up to 10 key-value pairs
			// We have 11 fields here, so Map.of() would cause a compile error
			Map<String, Object> response = new HashMap<>();
			response.put("id", profile.getId());
			response.put("name", profile.getName());
			response.put("slug", profile.getSlug());
			response.put("description", profile.getDescription() != null ? profile.getDescription() : "");
			response.put("meetingDurationMinutes", profile.getMeetingDurationMinutes());
			response.put("bookingWindowDays",
					profile.getBookingWindowDays() != null ? profile.getBookingWindowDays() : 30);
			response.put("timezone", profile.getTimezone() != null ? profile.getTimezone() : "Asia/Kolkata");
			response.put("collectName", Boolean.TRUE.equals(profile.getCollectName()));
			response.put("collectEmail", Boolean.TRUE.equals(profile.getCollectEmail()));
			response.put("collectPhone", Boolean.TRUE.equals(profile.getCollectPhone()));
			response.put("collectNotes", Boolean.TRUE.equals(profile.getCollectNotes()));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			return ResponseEntity.status(404).body(Map.of("error", "Booking page not found for: " + slug));
		}
	}

	@GetMapping("/{slug}/available-dates")
	public ResponseEntity<?> getAvailableDates(@PathVariable String slug,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		try {
			BookingProfile_t profile = profileService.getBySlug(slug);
			if (Boolean.FALSE.equals(profile.getIsActive())) {
				return ResponseEntity.ok(java.util.Collections.emptyList());
			}
			List<LocalDate> dates = availabilityService.getAvailableDates(profile.getId(), from, to);
			return ResponseEntity.ok(dates);
		} catch (Exception e) {
			// Return empty list rather than 404 so the frontend can still render the
			// calendar
			return ResponseEntity.ok(java.util.Collections.emptyList());
		}
	}

	@GetMapping("/{slug}/slots")
	public ResponseEntity<?> getSlots(@PathVariable String slug,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		try {
			BookingProfile_t profile = profileService.getBySlug(slug);
			if (Boolean.FALSE.equals(profile.getIsActive())) {
				return ResponseEntity.ok(new AvailableSlotsResponse());
			}
			AvailableSlotsResponse slots = availabilityService.getAvailableSlots(profile.getId(), date);
			return ResponseEntity.ok(slots);
		} catch (Exception e) {
			// FIX: return empty slots instead of 404 so frontend shows "No slots" not an
			// error
			AvailableSlotsResponse empty = new AvailableSlotsResponse();
			empty.setSlots(new java.util.ArrayList<>());
			return ResponseEntity.ok(empty);
		}
	}

	@PostMapping("/hold")
	public ResponseEntity<?> hold(@RequestBody SlotHoldRequest req) {
		try {
			SlotHold_t hold = holdService.placeHold(req);
			return ResponseEntity.ok(Map.of("holdToken", hold.getHoldToken(), "expiresAt",
					hold.getExpiresAt().toString(), "slotDate", hold.getSlotDate().toString(), "slotStart",
					hold.getSlotStart().toString(), "slotEnd", hold.getSlotEnd().toString()));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}

	@PostMapping("/confirm")
	public ResponseEntity<?> confirm(@RequestBody PublicBookingRequest req) {
		try {
			Appointment_t appt = appointmentService.confirmPublicBooking(req);
			return ResponseEntity.ok(Map.of("success", true, "appointmentNumber", appt.getAppointmentNumber(), "status",
					appt.getStatus(), "date", appt.getAppointmentDate().toString(), "startTime",
					appt.getStartTime().toString(), "endTime", appt.getEndTime().toString(), "customerName",
					appt.getCustomerName() != null ? appt.getCustomerName() : "", "message",
					"Your appointment has been confirmed!"));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}
}