package codewithhimanshu.appointment.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import codewithhimanshu.appointment.dto.RescheduleRequest;
import codewithhimanshu.appointment.entity.Appointment_t;
import codewithhimanshu.appointment.entity.Resource_t;
import codewithhimanshu.appointment.service.Appointment_Service;
import codewithhimanshu.appointment.service.CalendlyAppointmentService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/appointment")
public class Appointment_Controller {

	@Autowired
	private Appointment_Service appointmentService;
	@Autowired
	private CalendlyAppointmentService calendlyService;

	@PostMapping("/add")
	public ResponseEntity<?> bookAppointment(@RequestBody Appointment_t appointment) {
		return ResponseEntity.ok(appointmentService.bookAppointment(appointment));
	}

	@GetMapping("/getAll")
	public List<Appointment_t> getAllAppointments() {
		return appointmentService.getAllAppointments();
	}

	@GetMapping("/get/{id}")
	public ResponseEntity<?> getById(@PathVariable Long id) {
		Appointment_t a = appointmentService.getAppointmentById(id);
		if (a != null)
			return ResponseEntity.ok(a);
		return ResponseEntity.notFound().build();
	}

	@GetMapping("/getByCustomer/{customerId}")
	public List<Appointment_t> getByCustomer(@PathVariable Long customerId) {
		return appointmentService.getByCustomer(customerId);
	}

	@GetMapping("/getByDate")
	public List<Appointment_t> getByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		return appointmentService.getByDate(date);
	}

	@GetMapping("/getByStatus/{status}")
	public List<Appointment_t> getByStatus(@PathVariable String status) {
		return appointmentService.getByStatus(status);
	}

	@GetMapping("/availability")
	public List<Appointment_t> checkAvailability(@RequestParam Long resourceId,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		return appointmentService.checkResourceAvailability(resourceId, date);
	}

	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateAppointment(@PathVariable Long id, @RequestBody Appointment_t appointment) {
		return ResponseEntity.ok(appointmentService.updateAppointment(id, appointment));
	}

	@PutMapping("/updateStatus/{id}")
	public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
		return ResponseEntity.ok(appointmentService.updateStatus(id, body.get("status")));
	}

	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
		appointmentService.deleteAppointment(id);
		return ResponseEntity.ok("Appointment deleted");
	}

	@PostMapping("/{id}/cancel")
	public ResponseEntity<?> cancel(@PathVariable Long id, @RequestBody Map<String, String> body) {
		try {
			Appointment_t appt = calendlyService.cancel(id, body.getOrDefault("reason", "Cancelled by user"),
					body.getOrDefault("cancelledBy", "internal_user"));
			return ResponseEntity.ok(appt);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}

	@PostMapping("/{id}/reschedule")
	public ResponseEntity<?> reschedule(@PathVariable Long id, @RequestBody RescheduleRequest req) {
		try {
			return ResponseEntity.ok(calendlyService.reschedule(id, req));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}

	@PostMapping("/resource/add")
	public ResponseEntity<?> addResource(@RequestBody Resource_t resource) {
		return ResponseEntity.ok(appointmentService.saveResource(resource));
	}

	@GetMapping("/resource/getAll")
	public List<Resource_t> getAllResources() {
		return appointmentService.getAllResources();
	}

	@GetMapping("/resource/get/{id}")
	public ResponseEntity<?> getResourceById(@PathVariable Long id) {
		Resource_t r = appointmentService.getResourceById(id);
		if (r != null)
			return ResponseEntity.ok(r);
		return ResponseEntity.notFound().build();
	}

	@DeleteMapping("/resource/delete/{id}")
	public ResponseEntity<?> deleteResource(@PathVariable Long id) {
		appointmentService.deleteResource(id);
		return ResponseEntity.ok("Resource deleted");
	}

	@GetMapping("/getByProfile/{profileId}")
	public List<Appointment_t> getByProfile(@PathVariable Long profileId) {
		return appointmentService.getByBookingProfile(profileId);
	}

	@GetMapping("/getByProfiles")
	public List<Appointment_t> getByProfiles(@RequestParam List<Long> profileIds) {
		return appointmentService.getByBookingProfiles(profileIds);
	}
}