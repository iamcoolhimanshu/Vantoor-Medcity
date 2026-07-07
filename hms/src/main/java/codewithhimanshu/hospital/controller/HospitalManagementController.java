package codewithhimanshu.hospital.controller;

import codewithhimanshu.hospital.entity.*;
import codewithhimanshu.hospital.service.HospitalManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/hospital")
@CrossOrigin("*")
@RequiredArgsConstructor
@Tag(name = "Hospital Management")
public class HospitalManagementController {

	private final HospitalManagementService service;

	// DASHBOARD

	@GetMapping("/dashboard/summary")
	@Operation(summary = "Get hospital dashboard summary")
	public ResponseEntity<Map<String, Object>> getDashboard() {
		return ResponseEntity.ok(service.getDashboardSummary());
	}

	@PostMapping("/register")
	@Operation(summary = "Register a new hospital")
	public ResponseEntity<HospitalEntity> createHospital(@Valid @RequestBody HospitalEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createHospital(data));
	}

	@GetMapping("/list")
	@Operation(summary = "Get all hospitals")
	public ResponseEntity<List<HospitalEntity>> getAllHospitals() {
		return ResponseEntity.ok(service.getAllHospitals());
	}

	@GetMapping("/{id:\\d+}")
	@Operation(summary = "Get hospital by ID")
	public ResponseEntity<HospitalEntity> getHospitalById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getHospitalById(id));
	}

	@PutMapping("/{id:\\d+}")
	@Operation(summary = "Update hospital")
	public ResponseEntity<HospitalEntity> updateHospital(@PathVariable Long id,
			@Valid @RequestBody HospitalEntity data) {
		return ResponseEntity.ok(service.updateHospital(id, data));
	}

	@DeleteMapping("/{id:\\d+}")
	@Operation(summary = "Delete hospital (soft delete)")
	public ResponseEntity<Void> deleteHospital(@PathVariable Long id) {
		service.deleteHospital(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/department")
	@Operation(summary = "Create department")
	public ResponseEntity<DepartmentEntity> createDepartment(@Valid @RequestBody DepartmentEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createDepartment(data));
	}

	@GetMapping("/department/list")
	@Operation(summary = "Get all departments")
	public ResponseEntity<List<DepartmentEntity>> getAllDepartments() {
		return ResponseEntity.ok(service.getAllDepartments());
	}

	@GetMapping("/department/hospital/{hospitalId}")
	@Operation(summary = "Get departments by hospital")
	public ResponseEntity<List<DepartmentEntity>> getDeptsByHospital(@PathVariable Long hospitalId) {
		return ResponseEntity.ok(service.getDepartmentsByHospital(hospitalId));
	}

	@GetMapping("/department/{id}")
	public ResponseEntity<DepartmentEntity> getDeptById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getDepartmentById(id));
	}

	@PutMapping("/department/{id}")
	public ResponseEntity<DepartmentEntity> updateDept(@PathVariable Long id,
			@Valid @RequestBody DepartmentEntity data) {
		return ResponseEntity.ok(service.updateDepartment(id, data));
	}

	@DeleteMapping("/department/{id}")
	public ResponseEntity<Void> deleteDept(@PathVariable Long id) {
		service.deleteDepartment(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/doctor")
	@Operation(summary = "Create/add doctor")
	public ResponseEntity<DoctorEntity> createDoctor(@Valid @RequestBody DoctorEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createDoctor(data));
	}

	@GetMapping("/doctor/list")
	@Operation(summary = "Get all doctors")
	public ResponseEntity<List<DoctorEntity>> getAllDoctors() {
		return ResponseEntity.ok(service.getAllDoctors());
	}

	@GetMapping("/doctor/hospital/{hospitalId}")
	@Operation(summary = "Get doctors by hospital")
	public ResponseEntity<List<DoctorEntity>> getDoctorsByHospital(@PathVariable Long hospitalId) {
		return ResponseEntity.ok(service.getDoctorsByHospital(hospitalId));
	}

	@GetMapping("/doctor/specialization")
	@Operation(summary = "Get doctors by specialization")
	public ResponseEntity<List<DoctorEntity>> getDoctorsBySpecialization(@RequestParam String specialization) {
		return ResponseEntity.ok(service.getDoctorsBySpecialization(specialization));
	}

	@GetMapping("/doctor/{id}")
	public ResponseEntity<DoctorEntity> getDoctorById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getDoctorById(id));
	}

	@PutMapping("/doctor/{id}")
	public ResponseEntity<DoctorEntity> updateDoctor(@PathVariable Long id, @Valid @RequestBody DoctorEntity data) {
		return ResponseEntity.ok(service.updateDoctor(id, data));
	}

	@PutMapping("/doctor/{id}/deactivate")
	@Operation(summary = "Deactivate a doctor")
	public ResponseEntity<DoctorEntity> deactivateDoctor(@PathVariable Long id) {
		return ResponseEntity.ok(service.deactivateDoctor(id));
	}

	@DeleteMapping("/doctor/{id}")
	public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
		service.deleteDoctor(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/patient/register")
	@Operation(summary = "Register a new patient")
	public ResponseEntity<PatientEntity> createPatient(@Valid @RequestBody PatientEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createPatient(data));
	}

	@GetMapping("/patient/list")
	@Operation(summary = "Get all patients")
	public ResponseEntity<List<PatientEntity>> getAllPatients() {
		return ResponseEntity.ok(service.getAllPatients());
	}

	@GetMapping("/patient/{id}")
	public ResponseEntity<PatientEntity> getPatientById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getPatientById(id));
	}

	@GetMapping("/patient/uhid/{uhid}")
	@Operation(summary = "Get patient by UHID")
	public ResponseEntity<PatientEntity> getPatientByUhid(@PathVariable String uhid) {
		return ResponseEntity.ok(service.getPatientByUhid(uhid));
	}

	@GetMapping("/patient/search")
	@Operation(summary = "Search patients by name")
	public ResponseEntity<List<PatientEntity>> searchPatients(@RequestParam String name) {
		return ResponseEntity.ok(service.searchPatients(name));
	}

	@PutMapping("/patient/{id}")
	public ResponseEntity<PatientEntity> updatePatient(@PathVariable Long id, @Valid @RequestBody PatientEntity data) {
		return ResponseEntity.ok(service.updatePatient(id, data));
	}

	@DeleteMapping("/patient/{id}")
	public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
		service.deletePatient(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/appointment/list")
	@Operation(summary = "Get all appointments (OPD consultations)")
	public ResponseEntity<?> getAllAppointments() {
		return ResponseEntity.ok(service.getAllConsultations());
	}

	@PostMapping("/ward")
	public ResponseEntity<WardEntity> createWard(@Valid @RequestBody WardEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createWard(data));
	}

	@GetMapping("/ward/hospital/{hospitalId}")
	public ResponseEntity<List<WardEntity>> getWardsByHospital(@PathVariable Long hospitalId) {
		return ResponseEntity.ok(service.getWardsByHospital(hospitalId));
	}

	@GetMapping("/ward/{id:\\d+}")
	public ResponseEntity<WardEntity> getWardById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getWardById(id));
	}

	@GetMapping("/ward/beds")
	public ResponseEntity<List<BedEntity>> getWardBeds() {
		return ResponseEntity.ok(service.getAllBeds());
	}

	@PutMapping("/ward/{id:\\d+}")
	public ResponseEntity<WardEntity> updateWard(@PathVariable Long id, @Valid @RequestBody WardEntity data) {
		return ResponseEntity.ok(service.updateWard(id, data));
	}

	@DeleteMapping("/ward/{id:\\d+}")
	public ResponseEntity<Void> deleteWard(@PathVariable Long id) {
		service.deleteWard(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/ward/list")
	@Operation(summary = "Get all wards")
	public ResponseEntity<List<WardEntity>> getAllWards() {
		return ResponseEntity.ok(service.getAllWards());
	}

	@GetMapping({"/bed/list", "/beds"})
	@Operation(summary = "Get all beds")
	public ResponseEntity<List<BedEntity>> getAllBeds() {
		return ResponseEntity.ok(service.getAllBeds());
	}

	@PostMapping("/bed")
	public ResponseEntity<BedEntity> createBed(@Valid @RequestBody BedEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createBed(data));
	}

	@GetMapping("/bed/ward/{wardId}")
	public ResponseEntity<List<BedEntity>> getBedsByWard(@PathVariable Long wardId) {
		return ResponseEntity.ok(service.getBedsByWard(wardId));
	}

	@GetMapping("/bed/available/{hospitalId}")
	@Operation(summary = "Get available beds for a hospital")
	public ResponseEntity<List<BedEntity>> getAvailableBeds(@PathVariable Long hospitalId) {
		return ResponseEntity.ok(service.getAvailableBeds(hospitalId));
	}

	@GetMapping("/bed/{id}")
	public ResponseEntity<BedEntity> getBedById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getBedById(id));
	}

	@PutMapping("/bed/{id}")
	public ResponseEntity<BedEntity> updateBed(@PathVariable Long id, @Valid @RequestBody BedEntity data) {
		return ResponseEntity.ok(service.updateBed(id, data));
	}

	@PostMapping("/admission/create")
	@Operation(summary = "Create IPD admission")
	public ResponseEntity<IpdAdmissionEntity> createAdmission(@Valid @RequestBody IpdAdmissionEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createAdmission(data));
	}

	@GetMapping("/admission/list")
	public ResponseEntity<List<IpdAdmissionEntity>> getAllAdmissions() {
		return ResponseEntity.ok(service.getAllAdmissions());
	}

	@GetMapping("/admission/active")
	@Operation(summary = "Get all active (admitted) patients")
	public ResponseEntity<List<IpdAdmissionEntity>> getActiveAdmissions() {
		return ResponseEntity.ok(service.getActiveAdmissions());
	}

	@GetMapping("/admission/{id}")
	public ResponseEntity<IpdAdmissionEntity> getAdmissionById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getAdmissionById(id));
	}

	@GetMapping("/admission/patient/{patientId}")
	public ResponseEntity<List<IpdAdmissionEntity>> getAdmissionsByPatient(@PathVariable Long patientId) {
		return ResponseEntity.ok(service.getAdmissionsByPatient(patientId));
	}

	@PutMapping("/admission/{id}")
	public ResponseEntity<IpdAdmissionEntity> updateAdmission(@PathVariable Long id,
			@Valid @RequestBody IpdAdmissionEntity data) {
		return ResponseEntity.ok(service.updateAdmission(id, data));
	}

	@PostMapping("/discharge")
	@Operation(summary = "Create discharge summary and discharge patient")
	public ResponseEntity<DischargeSummaryEntity> discharge(@Valid @RequestBody DischargeSummaryEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createDischargeSummary(data));
	}

	@GetMapping("/discharge/admission/{admissionId}")
	public ResponseEntity<DischargeSummaryEntity> getDischargeByAdmission(@PathVariable Long admissionId) {
		return ResponseEntity.ok(service.getDischargeSummaryByAdmission(admissionId));
	}

	@GetMapping("/discharge/list")
	@Operation(summary = "Get all discharge summaries")
	public ResponseEntity<List<DischargeSummaryEntity>> getAllDischarges() {
		return ResponseEntity.ok(service.getAllDischargeSummaries());
	}

	@GetMapping("/discharge/{id}")
	public ResponseEntity<DischargeSummaryEntity> getDischargeById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getDischargeSummaryById(id));
	}

	@PutMapping("/discharge/{id}")
	public ResponseEntity<DischargeSummaryEntity> updateDischarge(@PathVariable Long id,
			@RequestBody DischargeSummaryEntity data) {
		return ResponseEntity.ok(service.updateDischargeSummary(id, data));
	}

	@PostMapping("/consultation")
	@Operation(summary = "Create OPD consultation")
	public ResponseEntity<OpdConsultationEntity> createConsultation(@Valid @RequestBody OpdConsultationEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createConsultation(data));
	}

	@GetMapping("/consultation/list")
	public ResponseEntity<List<OpdConsultationEntity>> getAllConsultations() {
		return ResponseEntity.ok(service.getAllConsultations());
	}

	@GetMapping("/consultation/{id}")
	public ResponseEntity<OpdConsultationEntity> getConsultationById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getConsultationById(id));
	}

	@GetMapping("/consultation/patient/{patientId}")
	public ResponseEntity<List<OpdConsultationEntity>> getConsultationsByPatient(@PathVariable Long patientId) {
		return ResponseEntity.ok(service.getConsultationsByPatient(patientId));
	}

	@PutMapping("/consultation/{id}")
	public ResponseEntity<OpdConsultationEntity> updateConsultation(@PathVariable Long id,
			@Valid @RequestBody OpdConsultationEntity data) {
		return ResponseEntity.ok(service.updateConsultation(id, data));
	}

	@PostMapping("/prescription/create")
	@Operation(summary = "Create prescription")
	public ResponseEntity<PrescriptionEntity> createPrescription(@Valid @RequestBody PrescriptionEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createPrescription(data));
	}

	@GetMapping("/prescription/patient/{patientId}")
	public ResponseEntity<List<PrescriptionEntity>> getPrescriptionsByPatient(@PathVariable Long patientId) {
		return ResponseEntity.ok(service.getPrescriptionsByPatient(patientId));
	}

	@GetMapping("/prescription/consultation/{consultationId}")
	public ResponseEntity<List<PrescriptionEntity>> getPrescriptionsByConsultation(@PathVariable Long consultationId) {
		return ResponseEntity.ok(service.getPrescriptionsByConsultation(consultationId));
	}

	@GetMapping("/prescription/admission/{admissionId}")
	public ResponseEntity<List<PrescriptionEntity>> getPrescriptionsByAdmission(@PathVariable Long admissionId) {
		return ResponseEntity.ok(service.getPrescriptionsByAdmission(admissionId));
	}

	@GetMapping("/prescription/list")
	@Operation(summary = "Get all prescriptions")
	public ResponseEntity<List<PrescriptionEntity>> getAllPrescriptions() {
		return ResponseEntity.ok(service.getAllPrescriptions());
	}

	@GetMapping("/prescription/{id}")
	public ResponseEntity<PrescriptionEntity> getPrescriptionById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getPrescriptionById(id));
	}

	@PutMapping("/prescription/{id}")
	public ResponseEntity<PrescriptionEntity> updatePrescription(@PathVariable Long id,
			@Valid @RequestBody PrescriptionEntity data) {
		return ResponseEntity.ok(service.updatePrescription(id, data));
	}

	@PostMapping("/lab/order")
	@Operation(summary = "Order a lab test")
	public ResponseEntity<LabTestEntity> orderLabTest(@Valid @RequestBody LabTestEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createLabTest(data));
	}

	@GetMapping("/lab/list")
	public ResponseEntity<List<LabTestEntity>> getAllLabTests() {
		return ResponseEntity.ok(service.getAllLabTests());
	}

	@GetMapping("/lab/{id}")
	public ResponseEntity<LabTestEntity> getLabTestById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getLabTestById(id));
	}

	@GetMapping("/lab/patient/{patientId}")
	public ResponseEntity<List<LabTestEntity>> getLabTestsByPatient(@PathVariable Long patientId) {
		return ResponseEntity.ok(service.getLabTestsByPatient(patientId));
	}

	@PutMapping("/lab/{id}")
	public ResponseEntity<LabTestEntity> updateLabTest(@PathVariable Long id, @Valid @RequestBody LabTestEntity data) {
		return ResponseEntity.ok(service.updateLabTest(id, data));
	}

	@PutMapping("/lab/{id}/result")
	@Operation(summary = "Upload lab test result")
	public ResponseEntity<LabTestEntity> uploadResult(@PathVariable Long id, @RequestParam String result,
			@RequestParam String resultStatus, @RequestParam(required = false) String reportUrl) {
		return ResponseEntity.ok(service.uploadLabResult(id, result, resultStatus, reportUrl));
	}

	@PostMapping("/pharmacy/medicine")
	@Operation(summary = "Add medicine to inventory")
	public ResponseEntity<MedicineInventoryEntity> addMedicine(@Valid @RequestBody MedicineInventoryEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.addMedicine(data));
	}

	@GetMapping({"/pharmacy/medicine/list", "/pharmacy/medicines"})
	public ResponseEntity<List<MedicineInventoryEntity>> getAllMedicines() {
		return ResponseEntity.ok(service.getAllMedicines());
	}

	@GetMapping("/pharmacy/medicine/{id:\\d+}")
	public ResponseEntity<MedicineInventoryEntity> getMedicineById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getMedicineById(id));
	}

	@PutMapping("/pharmacy/medicine/{id:\\d+}")
	public ResponseEntity<MedicineInventoryEntity> updateMedicine(@PathVariable Long id,
			@Valid @RequestBody MedicineInventoryEntity data) {
		return ResponseEntity.ok(service.updateMedicine(id, data));
	}

	@GetMapping("/pharmacy/medicine/low-stock")
	@Operation(summary = "Get low stock medicines")
	public ResponseEntity<List<MedicineInventoryEntity>> getLowStockMedicines() {
		return ResponseEntity.ok(service.getLowStockMedicines());
	}

	@GetMapping("/pharmacy/medicine/expiring")
	@Operation(summary = "Get medicines expiring in N days")
	public ResponseEntity<List<MedicineInventoryEntity>> getExpiringMedicines(
			@RequestParam(defaultValue = "30") int days) {
		return ResponseEntity.ok(service.getExpiringMedicines(days));
	}

	@PostMapping("/pharmacy/dispense")
	@Operation(summary = "Dispense medicine to patient")
	public ResponseEntity<MedicineDispensingEntity> dispenseMedicine(@RequestBody MedicineDispensingEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.dispenseMedicine(data));
	}

	@GetMapping("/pharmacy/dispense/patient/{patientId}")
	public ResponseEntity<List<MedicineDispensingEntity>> getDispensingByPatient(@PathVariable Long patientId) {
		return ResponseEntity.ok(service.getDispensingByPatient(patientId));
	}

	@PostMapping("/billing/generate")
	@Operation(summary = "Generate invoice")
	public ResponseEntity<HospitalInvoiceEntity> generateInvoice(@Valid @RequestBody HospitalInvoiceEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.generateInvoice(data));
	}

	@GetMapping({"/billing/list", "/billing/invoices", "/invoices"})
	public ResponseEntity<List<HospitalInvoiceEntity>> getAllInvoices() {
		return ResponseEntity.ok(service.getAllInvoices());
	}

	@GetMapping("/billing/{id:\\d+}")
	public ResponseEntity<HospitalInvoiceEntity> getInvoiceById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getInvoiceById(id));
	}

	@GetMapping("/billing/patient/{patientId}")
	public ResponseEntity<List<HospitalInvoiceEntity>> getInvoicesByPatient(@PathVariable Long patientId) {
		return ResponseEntity.ok(service.getInvoicesByPatient(patientId));
	}

	@PutMapping("/billing/{id:\\d+}")
	public ResponseEntity<HospitalInvoiceEntity> updateInvoice(@PathVariable Long id,
			@RequestBody HospitalInvoiceEntity data) {
		return ResponseEntity.ok(service.updateInvoice(id, data));
	}

	@PostMapping("/billing/payment")
	@Operation(summary = "Collect payment against invoice")
	public ResponseEntity<HospitalPaymentEntity> collectPayment(@RequestBody HospitalPaymentEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.collectPayment(data));
	}

	@GetMapping("/billing/payment/{invoiceId}")
	public ResponseEntity<List<HospitalPaymentEntity>> getPaymentsByInvoice(@PathVariable Long invoiceId) {
		return ResponseEntity.ok(service.getPaymentsByInvoice(invoiceId));
	}

	@PostMapping("/emergency/register")
	@Operation(summary = "Register emergency case")
	public ResponseEntity<EmergencyEntity> createEmergency(@Valid @RequestBody EmergencyEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createEmergency(data));
	}

	@GetMapping("/emergency/list")
	public ResponseEntity<List<EmergencyEntity>> getAllEmergencies() {
		return ResponseEntity.ok(service.getAllEmergencies());
	}

	@GetMapping("/emergency/active")
	@Operation(summary = "Get all active emergencies")
	public ResponseEntity<List<EmergencyEntity>> getActiveEmergencies() {
		return ResponseEntity.ok(service.getActiveEmergencies());
	}

	@GetMapping("/emergency/{id}")
	public ResponseEntity<EmergencyEntity> getEmergencyById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getEmergencyById(id));
	}

	@PutMapping("/emergency/{id}")
	public ResponseEntity<EmergencyEntity> updateEmergency(@PathVariable Long id,
			@Valid @RequestBody EmergencyEntity data) {
		return ResponseEntity.ok(service.updateEmergency(id, data));
	}

	@PostMapping("/ot/schedule")
	@Operation(summary = "Schedule operation theatre")
	public ResponseEntity<OtScheduleEntity> scheduleOt(@Valid @RequestBody OtScheduleEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.scheduleOt(data));
	}

	@GetMapping("/ot/list")
	public ResponseEntity<List<OtScheduleEntity>> getAllOtSchedules() {
		return ResponseEntity.ok(service.getAllOtSchedules());
	}

	@GetMapping("/ot/{id}")
	public ResponseEntity<OtScheduleEntity> getOtById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getOtById(id));
	}

	@PutMapping("/ot/{id}")
	public ResponseEntity<OtScheduleEntity> updateOt(@PathVariable Long id, @Valid @RequestBody OtScheduleEntity data) {
		return ResponseEntity.ok(service.updateOtSchedule(id, data));
	}

	@PostMapping("/nursing/note")
	@Operation(summary = "Add nursing note for admitted patient")
	public ResponseEntity<NursingNotesEntity> addNursingNote(@Valid @RequestBody NursingNotesEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.addNursingNote(data));
	}

	@GetMapping("/nursing/list")
	@Operation(summary = "Get all nursing notes")
	public ResponseEntity<List<NursingNotesEntity>> getAllNursingNotes() {
		return ResponseEntity.ok(service.getAllNursingNotes());
	}

	@GetMapping("/nursing/admission/{admissionId}")
	public ResponseEntity<List<NursingNotesEntity>> getNursingNotesByAdmission(@PathVariable Long admissionId) {
		return ResponseEntity.ok(service.getNursingNotesByAdmission(admissionId));
	}

	@PostMapping("/insurance/claim")
	@Operation(summary = "Submit insurance claim")
	public ResponseEntity<InsuranceClaimEntity> createClaim(@Valid @RequestBody InsuranceClaimEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createInsuranceClaim(data));
	}

	@GetMapping("/insurance/list")
	public ResponseEntity<List<InsuranceClaimEntity>> getAllClaims() {
		return ResponseEntity.ok(service.getAllInsuranceClaims());
	}

	@GetMapping("/insurance/{id}")
	public ResponseEntity<InsuranceClaimEntity> getClaimById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getInsuranceClaimById(id));
	}

	@PutMapping("/insurance/{id}")
	public ResponseEntity<InsuranceClaimEntity> updateClaim(@PathVariable Long id,
			@RequestBody InsuranceClaimEntity data) {
		return ResponseEntity.ok(service.updateInsuranceClaim(id, data));
	}

	@GetMapping("/audit/logs")
	@Operation(summary = "Get all audit logs")
	public ResponseEntity<List<HospitalAuditLogEntity>> getAuditLogs() {
		return ResponseEntity.ok(service.getAuditLogs());
	}

	@GetMapping("/audit/logs/{module}")
	@Operation(summary = "Get audit logs by module")
	public ResponseEntity<List<HospitalAuditLogEntity>> getAuditLogsByModule(@PathVariable String module) {
		return ResponseEntity.ok(service.getAuditLogsByModule(module));
	}

	@Operation(summary = "Create staff member")
	@PostMapping("/staff")
	@PreAuthorize("hasAnyRole('ADMIN','HOSPITAL_ADMIN')")
	public ResponseEntity<?> createStaff(@Valid @RequestBody HospitalStaffEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createStaff(data));
	}

	@Operation(summary = "List all staff")
	@GetMapping("/staff/list")
	public ResponseEntity<?> getAllStaff() {
		return ResponseEntity.ok(service.getAllStaff());
	}

	@Operation(summary = "Staff by hospital")
	@GetMapping("/staff/hospital/{hospitalId}")
	public ResponseEntity<?> getStaffByHospital(@PathVariable Long hospitalId) {
		return ResponseEntity.ok(service.getStaffByHospital(hospitalId));
	}

	@Operation(summary = "Staff by role (NURSE, LAB_TECHNICIAN, etc.)")
	@GetMapping("/staff/role")
	public ResponseEntity<?> getStaffByRole(@RequestParam String role) {
		return ResponseEntity.ok(service.getStaffByRole(role));
	}

	@Operation(summary = "Get staff by ID")
	@GetMapping("/staff/{id}")
	public ResponseEntity<?> getStaffById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getStaffById(id));
	}

	@Operation(summary = "Update staff")
	@PutMapping("/staff/{id}")
	@PreAuthorize("hasAnyRole('ADMIN','HOSPITAL_ADMIN')")
	public ResponseEntity<?> updateStaff(@PathVariable Long id, @Valid @RequestBody HospitalStaffEntity data) {
		return ResponseEntity.ok(service.updateStaff(id, data));
	}

	@Operation(summary = "Delete staff (soft)")
	@DeleteMapping("/staff/{id}")
	@PreAuthorize("hasAnyRole('ADMIN','HOSPITAL_ADMIN')")
	public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
		service.deleteStaff(id);
		return ResponseEntity.ok(Map.of("message", "Staff deleted successfully"));
	}

	@Operation(summary = "Collect advance payment")
	@PostMapping("/billing/advance")
	@PreAuthorize("hasAnyRole('ADMIN','BILLING_EXECUTIVE','RECEPTIONIST')")
	public ResponseEntity<?> collectAdvance(@Valid @RequestBody AdvancePaymentEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.collectAdvancePayment(data));
	}

	@Operation(summary = "List advances by patient")
	@GetMapping("/billing/advance/patient/{patientId}")
	public ResponseEntity<?> getAdvancesByPatient(@PathVariable Long patientId) {
		return ResponseEntity.ok(service.getAdvancesByPatient(patientId));
	}

	@Operation(summary = "List advances by admission")
	@GetMapping("/billing/advance/admission/{admissionId}")
	public ResponseEntity<?> getAdvancesByAdmission(@PathVariable Long admissionId) {
		return ResponseEntity.ok(service.getAdvancesByAdmission(admissionId));
	}

	@Operation(summary = "Get all advance payments")
	@GetMapping("/billing/advance/all")
	public ResponseEntity<?> getAllAdvances() {
		return ResponseEntity.ok(service.getAllAdvancePayments());
	}

	@Operation(summary = "Get advance by ID")
	@GetMapping("/billing/advance/{id}")
	public ResponseEntity<?> getAdvanceById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getAdvanceById(id));
	}

	@Operation(summary = "Adjust advance against invoice")
	@PutMapping("/billing/advance/{id}/adjust")
	@PreAuthorize("hasAnyRole('ADMIN','BILLING_EXECUTIVE')")
	public ResponseEntity<?> adjustAdvance(@PathVariable Long id, @RequestParam Long invoiceId,
			@RequestParam java.math.BigDecimal amount) {
		return ResponseEntity.ok(service.adjustAdvanceAgainstInvoice(id, invoiceId, amount));
	}

	@Operation(summary = "Add line item to invoice")
	@PostMapping("/billing/{invoiceId}/item")
	@PreAuthorize("hasAnyRole('ADMIN','BILLING_EXECUTIVE')")
	public ResponseEntity<?> addInvoiceItem(@PathVariable Long invoiceId, @Valid @RequestBody InvoiceItemEntity item) {
		item.setInvoiceId(invoiceId);
		return ResponseEntity.status(HttpStatus.CREATED).body(service.addInvoiceItem(item));
	}

	@Operation(summary = "Get all line items for an invoice")
	@GetMapping("/billing/{invoiceId}/items")
	public ResponseEntity<?> getInvoiceItems(@PathVariable Long invoiceId) {
		return ResponseEntity.ok(service.getItemsByInvoice(invoiceId));
	}

	@Operation(summary = "Delete invoice line item")
	@DeleteMapping("/billing/item/{itemId}")
	@PreAuthorize("hasAnyRole('ADMIN','BILLING_EXECUTIVE')")
	public ResponseEntity<?> deleteInvoiceItem(@PathVariable Long itemId) {
		service.deleteInvoiceItem(itemId);
		return ResponseEntity.ok(Map.of("message", "Item removed"));
	}

	@Operation(summary = "Finalise and lock invoice (no edits after this)")
	@PutMapping("/billing/{id}/finalize")
	@PreAuthorize("hasAnyRole('ADMIN','BILLING_EXECUTIVE')")
	public ResponseEntity<?> finalizeInvoice(@PathVariable Long id) {
		return ResponseEntity.ok(service.finalizeInvoice(id));
	}

	@Operation(summary = "Initiate refund request")
	@PostMapping("/billing/refund")
	@PreAuthorize("hasAnyRole('ADMIN','BILLING_EXECUTIVE','RECEPTIONIST')")
	public ResponseEntity<?> initiateRefund(@Valid @RequestBody RefundEntity data) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.initiateRefund(data));
	}

	@Operation(summary = "Approve refund request")
	@PutMapping("/billing/refund/{id}/approve")
	@PreAuthorize("hasAnyRole('ADMIN','FINANCE_ADMIN')")
	public ResponseEntity<?> approveRefund(@PathVariable Long id, @RequestParam String approvedBy,
			@RequestParam(required = false) String remarks) {
		return ResponseEntity.ok(service.approveRefund(id, approvedBy, remarks));
	}

	@Operation(summary = "Process (execute) an approved refund")
	@PutMapping("/billing/refund/{id}/process")
	@PreAuthorize("hasAnyRole('ADMIN','FINANCE_ADMIN')")
	public ResponseEntity<?> processRefund(@PathVariable Long id,
			@RequestParam(required = false) String transactionId) {
		return ResponseEntity.ok(service.processRefund(id, transactionId));
	}

	@Operation(summary = "List all refunds")
	@GetMapping("/billing/refund/list")
	public ResponseEntity<?> getAllRefunds() {
		return ResponseEntity.ok(service.getAllRefunds());
	}

	@Operation(summary = "Refunds by patient")
	@GetMapping("/billing/refund/patient/{patientId}")
	public ResponseEntity<?> getRefundsByPatient(@PathVariable Long patientId) {
		return ResponseEntity.ok(service.getRefundsByPatient(patientId));
	}

	@Operation(summary = "Get refund by ID")
	@GetMapping("/billing/refund/{id}")
	public ResponseEntity<?> getRefundById(@PathVariable Long id) {
		return ResponseEntity.ok(service.getRefundById(id));
	}

	@Operation(summary = "Transfer patient to a different bed")
	@PutMapping("/admission/{admissionId}/transfer-bed")
	@PreAuthorize("hasAnyRole('ADMIN','HOSPITAL_ADMIN','WARD_MANAGER')")
	public ResponseEntity<?> transferBed(@PathVariable Long admissionId, @RequestParam Long newBedId,
			@RequestParam String reason) {
		return ResponseEntity.ok(service.transferBed(admissionId, newBedId, reason));
	}

	@Operation(summary = "Convert emergency case to IPD admission")
	@PostMapping("/emergency/{emergencyId}/convert-to-admission")
	@PreAuthorize("hasAnyRole('ADMIN','HOSPITAL_ADMIN','DOCTOR')")
	public ResponseEntity<?> convertEmergencyToAdmission(@PathVariable Long emergencyId,
			@Valid @RequestBody IpdAdmissionEntity admissionData) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(service.convertEmergencyToAdmission(emergencyId, admissionData));
	}

	@Operation(summary = "Search medicines by name")
	@GetMapping("/pharmacy/medicine/search")
	public ResponseEntity<?> searchMedicines(@RequestParam String name) {
		return ResponseEntity.ok(service.searchMedicinesByName(name));
	}
}