package codewithhimanshu.appointment.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import codewithhimanshu.appointment.entity.Appointment_t;
import codewithhimanshu.appointment.entity.Resource_t;
import codewithhimanshu.appointment.repository.Appointment_Repository;
import codewithhimanshu.appointment.repository.Resource_Repository;
import codewithhimanshu.hospital.service.AppUserServiceImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class Appointment_Service {

	@Autowired
	private Appointment_Repository appointmentRepo;
	@Autowired
	private Resource_Repository resourceRepo;
	@Autowired
	private AppUserServiceImpl appUserService;

	// ─── Appointments ─────────────────────────────────────────────────────────

	public List<Appointment_t> getAllAppointments() {
		try {
			Long accountId = appUserService.getLoggedInUserAccountId();
			if (accountId == null)
				return appointmentRepo.findAll();
			return appointmentRepo.findByAccountIdOrderByAppointmentDateDescStartTimeDesc(accountId);
		} catch (Exception e) {
			return appointmentRepo.findAll();
		}
	}

	public Appointment_t getAppointmentById(Long id) {
		return appointmentRepo.findById(id).orElse(null);
	}

	public List<Appointment_t> getByCustomer(Long customerId) {
		Long accountId = appUserService.getLoggedInUserAccountId();
		return appointmentRepo.findByCustomerIdAndAccountId(customerId, accountId);
	}

	public List<Appointment_t> getByDate(LocalDate date) {
		Long accountId = appUserService.getLoggedInUserAccountId();
		return appointmentRepo.findByAppointmentDateAndAccountId(date, accountId);
	}

	public List<Appointment_t> getByStatus(String status) {
		Long accountId = appUserService.getLoggedInUserAccountId();
		return appointmentRepo.findByStatusAndAccountId(status, accountId);
	}

	public List<Appointment_t> checkResourceAvailability(Long resourceId, LocalDate date) {
		Long accountId = appUserService.getLoggedInUserAccountId();
		return appointmentRepo.findByResourceIdAndAppointmentDateAndAccountId(resourceId, date, accountId);
	}

	public Appointment_t bookAppointment(Appointment_t appointment) {
		Long accountId = appUserService.getLoggedInUserAccountId();
		if (accountId != null)
			appointment.setAccountId(accountId);
		appointment.setStatus("SCHEDULED");
		appointment.setAppointmentNumber(generateAppointmentNumber());
		return appointmentRepo.save(appointment);
	}

	public Appointment_t updateAppointment(Long id, Appointment_t updated) {
		Appointment_t existing = appointmentRepo.findById(id)
				.orElseThrow(() -> new RuntimeException("Appointment not found"));
		existing.setCustomerId(updated.getCustomerId());
		existing.setCustomerName(updated.getCustomerName());
		existing.setCustomerPhone(updated.getCustomerPhone());
		existing.setCustomerEmail(updated.getCustomerEmail());
		existing.setServiceItemId(updated.getServiceItemId());
		existing.setServiceName(updated.getServiceName());
		existing.setResourceId(updated.getResourceId());
		existing.setResourceName(updated.getResourceName());
		existing.setAppointmentDate(updated.getAppointmentDate());
		existing.setStartTime(updated.getStartTime());
		existing.setEndTime(updated.getEndTime());
		existing.setDurationMinutes(updated.getDurationMinutes());
		existing.setNotes(updated.getNotes());
		existing.setStatus(updated.getStatus());
		// FIX: bookingProfileId, timezone, source were missing — caused booking profile
		// to reset
		existing.setBookingProfileId(updated.getBookingProfileId());
		existing.setTimezone(updated.getTimezone());
		if (updated.getSource() != null)
			existing.setSource(updated.getSource());
		return appointmentRepo.save(existing);
	}

	public Appointment_t updateStatus(Long id, String status) {
		Appointment_t appt = appointmentRepo.findById(id)
				.orElseThrow(() -> new RuntimeException("Appointment not found"));
		appt.setStatus(status);
		return appointmentRepo.save(appt);
	}

	public void deleteAppointment(Long id) {
		appointmentRepo.deleteById(id);
	}

	// ─── Resources ────────────────────────────────────────────────────────────

	public List<Resource_t> getAllResources() {
		try {
			Long accountId = appUserService.getLoggedInUserAccountId();
			if (accountId == null)
				return resourceRepo.findAll();
			return resourceRepo.findByAccountId(accountId);
		} catch (Exception e) {
			return resourceRepo.findAll();
		}
	}

	public Resource_t getResourceById(Long id) {
		return resourceRepo.findById(id).orElse(null);
	}

	public Resource_t saveResource(Resource_t resource) {
		Long accountId = appUserService.getLoggedInUserAccountId();
		if (accountId != null)
			resource.setAccountId(accountId);
		return resourceRepo.save(resource);
	}

	public void deleteResource(Long id) {
		resourceRepo.deleteById(id);
	}

	private String generateAppointmentNumber() {
		String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
		return "APT-" + ts;
	}

	public List<Appointment_t> getByBookingProfile(Long bookingProfileId) {
		Long accountId = appUserService.getLoggedInUserAccountId();
		if (accountId == null)
			return appointmentRepo.findAll();
		return appointmentRepo.findByBookingProfileIdAndAccountId(bookingProfileId, accountId);
	}

	public List<Appointment_t> getByBookingProfiles(List<Long> bookingProfileIds) {
		Long accountId = appUserService.getLoggedInUserAccountId();
		if (accountId == null)
			return appointmentRepo.findAll();
		if (bookingProfileIds == null || bookingProfileIds.isEmpty()) {
			return appointmentRepo.findByAccountIdOrderByAppointmentDateDescStartTimeDesc(accountId);
		}
		return appointmentRepo.findByBookingProfileIdInAndAccountId(bookingProfileIds, accountId);
	}
}