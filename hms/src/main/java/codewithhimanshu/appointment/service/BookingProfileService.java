package codewithhimanshu.appointment.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import codewithhimanshu.appointment.entity.BookingDateOverride_t;
import codewithhimanshu.appointment.entity.BookingProfile_t;
import codewithhimanshu.appointment.entity.BookingWorkingHours_t;
import codewithhimanshu.appointment.repository.BookingDateOverrideRepository;
import codewithhimanshu.appointment.repository.BookingProfileRepository;
import codewithhimanshu.appointment.repository.BookingWorkingHoursRepository;
import codewithhimanshu.hospital.service.AppUserServiceImpl;

import java.util.List;

@Service
public class BookingProfileService {

	@Autowired
	private BookingProfileRepository profileRepo;
	@Autowired
	private BookingWorkingHoursRepository workingHoursRepo;
	@Autowired
	private BookingDateOverrideRepository overrideRepo;
	@Autowired
	private AppUserServiceImpl appUserService;

	public List<BookingProfile_t> getAll() {
		try {
			Long accountId = appUserService.getLoggedInUserAccountId();
			if (accountId == null)
				return profileRepo.findAll();
			return profileRepo.findByAccountId(accountId);
		} catch (Exception e) {
			return profileRepo.findAll();
		}
	}

	public List<BookingProfile_t> getActive() {
		try {
			Long accountId = appUserService.getLoggedInUserAccountId();
			if (accountId == null)
				return profileRepo.findAll();
			return profileRepo.findByAccountIdAndIsActiveTrue(accountId);
		} catch (Exception e) {
			return profileRepo.findAll();
		}
	}

	public BookingProfile_t getById(Long id) {
		return profileRepo.findById(id).orElseThrow(() -> new RuntimeException("Booking profile not found: " + id));
	}

	public BookingProfile_t getBySlug(String slug) {
		return profileRepo.findBySlug(slug)
				.orElseThrow(() -> new RuntimeException("Booking profile not found for slug: " + slug));
	}

	@Transactional
	public BookingProfile_t create(BookingProfile_t profile) {
		try {
			Long accountId = appUserService.getLoggedInUserAccountId();
			if (accountId != null)
				profile.setAccountId(accountId);
		} catch (Exception ignored) {
		}

		// Generate slug if not provided
		if (profile.getSlug() == null || profile.getSlug().isBlank()) {
			profile.setSlug(generateSlug(profile.getName()));
		}

		// Ensure slug uniqueness
		String baseSlug = profile.getSlug();
		int suffix = 1;
		while (profileRepo.existsBySlug(profile.getSlug())) {
			profile.setSlug(baseSlug + "-" + suffix++);
		}

		return profileRepo.save(profile);
	}

	@Transactional
	public BookingProfile_t update(Long id, BookingProfile_t updated) {
		BookingProfile_t existing = getById(id);
		existing.setName(updated.getName());
		existing.setDescription(updated.getDescription());
		existing.setMeetingDurationMinutes(updated.getMeetingDurationMinutes());
		existing.setSlotIntervalMinutes(updated.getSlotIntervalMinutes());
		existing.setMaxBookingsPerSlot(updated.getMaxBookingsPerSlot());
		existing.setBookingWindowType(updated.getBookingWindowType());
		existing.setBookingWindowDays(updated.getBookingWindowDays());
		existing.setMinNoticeMinutes(updated.getMinNoticeMinutes());
		existing.setBufferBeforeMinutes(updated.getBufferBeforeMinutes());
		existing.setBufferAfterMinutes(updated.getBufferAfterMinutes());
		existing.setMaxBookingsPerDay(updated.getMaxBookingsPerDay());
		existing.setTimezone(updated.getTimezone());
		existing.setVisibility(updated.getVisibility());
		existing.setIsActive(updated.getIsActive());
		existing.setCancelAllowed(updated.getCancelAllowed());
		existing.setRescheduleAllowed(updated.getRescheduleAllowed());
		existing.setCollectName(updated.getCollectName());
		existing.setCollectEmail(updated.getCollectEmail());
		existing.setCollectPhone(updated.getCollectPhone());
		existing.setCollectNotes(updated.getCollectNotes());
		existing.setConfirmationType(updated.getConfirmationType());
		existing.setServiceItemId(updated.getServiceItemId());
		existing.setServiceName(updated.getServiceName());
		existing.setResourceId(updated.getResourceId());
		existing.setResourceName(updated.getResourceName());
		return profileRepo.save(existing);
	}

	public void delete(Long id) {
		profileRepo.deleteById(id);
	}

	// ── Working Hours ─────────────────────────────────────────────────────────

	public List<BookingWorkingHours_t> getWorkingHours(Long profileId) {
		return workingHoursRepo.findByBookingProfileIdOrderByDayOfWeek(profileId);
	}

	@Transactional
	public List<BookingWorkingHours_t> saveWorkingHours(Long profileId, List<BookingWorkingHours_t> hours) {
		workingHoursRepo.deleteByBookingProfileId(profileId);
		hours.forEach(h -> h.setBookingProfileId(profileId));
		return workingHoursRepo.saveAll(hours);
	}

	public List<BookingDateOverride_t> getOverrides(Long profileId) {
		return overrideRepo.findByBookingProfileId(profileId);
	}

	public BookingDateOverride_t addOverride(Long profileId, BookingDateOverride_t override) {
		override.setBookingProfileId(profileId);
		return overrideRepo.save(override);
	}

	public void deleteOverride(Long overrideId) {
		overrideRepo.deleteById(overrideId);
	}

	private String generateSlug(String name) {
		return name.toLowerCase().replaceAll("[^a-z0-9\\s-]", "").replaceAll("\\s+", "-").replaceAll("-+", "-")
				.replaceAll("^-|-$", "");
	}
}