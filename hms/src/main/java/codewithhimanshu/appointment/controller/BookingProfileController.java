package codewithhimanshu.appointment.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import codewithhimanshu.appointment.entity.BookingDateOverride_t;
import codewithhimanshu.appointment.entity.BookingProfile_t;
import codewithhimanshu.appointment.entity.BookingWorkingHours_t;
import codewithhimanshu.appointment.service.AvailabilityService;
import codewithhimanshu.appointment.service.BookingProfileService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/booking-profile")
public class BookingProfileController {

	@Autowired
	private BookingProfileService profileService;
	@Autowired
	private AvailabilityService availabilityService;

	@GetMapping("/getAll")
	public List<BookingProfile_t> getAll() {
		return profileService.getAll();
	}

	@GetMapping("/getActive")
	public List<BookingProfile_t> getActive() {
		return profileService.getActive();
	}

	@GetMapping("/get/{id}")
	public ResponseEntity<?> getById(@PathVariable Long id) {
		return ResponseEntity.ok(profileService.getById(id));
	}

	@GetMapping("/bySlug/{slug}")
	public ResponseEntity<?> getBySlug(@PathVariable String slug) {
		return ResponseEntity.ok(profileService.getBySlug(slug));
	}

	@PostMapping("/add")
	public ResponseEntity<?> create(@RequestBody BookingProfile_t profile) {
		return ResponseEntity.ok(profileService.create(profile));
	}

	@PutMapping("/update/{id}")
	public ResponseEntity<?> update(@PathVariable Long id, @RequestBody BookingProfile_t profile) {
		return ResponseEntity.ok(profileService.update(id, profile));
	}

	@PutMapping("/toggleActive/{id}")
	public ResponseEntity<?> toggleActive(@PathVariable Long id) {
		BookingProfile_t p = profileService.getById(id);
		p.setIsActive(!Boolean.TRUE.equals(p.getIsActive()));
		return ResponseEntity.ok(profileService.update(id, p));
	}

	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> delete(@PathVariable Long id) {
		profileService.delete(id);
		return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
	}

	// ── Working Hours ─────────────────────────────────────────────────────────

	@GetMapping("/{profileId}/working-hours")
	public List<BookingWorkingHours_t> getWorkingHours(@PathVariable Long profileId) {
		return profileService.getWorkingHours(profileId);
	}

	@PostMapping("/{profileId}/working-hours")
	public ResponseEntity<?> saveWorkingHours(@PathVariable Long profileId,
			@RequestBody List<BookingWorkingHours_t> hours) {
		return ResponseEntity.ok(profileService.saveWorkingHours(profileId, hours));
	}

	// ── Date Overrides ────────────────────────────────────────────────────────

	@GetMapping("/{profileId}/overrides")
	public List<BookingDateOverride_t> getOverrides(@PathVariable Long profileId) {
		return profileService.getOverrides(profileId);
	}

	@PostMapping("/{profileId}/overrides")
	public ResponseEntity<?> addOverride(@PathVariable Long profileId, @RequestBody BookingDateOverride_t override) {
		return ResponseEntity.ok(profileService.addOverride(profileId, override));
	}

	@DeleteMapping("/overrides/{overrideId}")
	public ResponseEntity<?> deleteOverride(@PathVariable Long overrideId) {
		profileService.deleteOverride(overrideId);
		return ResponseEntity.ok(Map.of("message", "Deleted"));
	}

	@GetMapping("/{profileId}/slots")
	public ResponseEntity<?> getSlots(@PathVariable Long profileId,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		return ResponseEntity.ok(availabilityService.getAvailableSlots(profileId, date));
	}

	@GetMapping("/{profileId}/available-dates")
	public ResponseEntity<?> getAvailableDates(@PathVariable Long profileId,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return ResponseEntity.ok(availabilityService.getAvailableDates(profileId, from, to));
	}
}
