package codewithhimanshu.hospital.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import codewithhimanshu.hospital.entity.AdvancePaymentEntity;
import codewithhimanshu.hospital.entity.BedEntity;
import codewithhimanshu.hospital.entity.DepartmentEntity;
import codewithhimanshu.hospital.entity.DischargeSummaryEntity;
import codewithhimanshu.hospital.entity.DoctorEntity;
import codewithhimanshu.hospital.entity.EmergencyEntity;
import codewithhimanshu.hospital.entity.HospitalAuditLogEntity;
import codewithhimanshu.hospital.entity.HospitalBaseEntity;
import codewithhimanshu.hospital.entity.HospitalEntity;
import codewithhimanshu.hospital.entity.HospitalInvoiceEntity;
import codewithhimanshu.hospital.entity.HospitalPaymentEntity;
import codewithhimanshu.hospital.entity.HospitalStaffEntity;
import codewithhimanshu.hospital.entity.InsuranceClaimEntity;
import codewithhimanshu.hospital.entity.InvoiceItemEntity;
import codewithhimanshu.hospital.entity.IpdAdmissionEntity;
import codewithhimanshu.hospital.entity.LabTestEntity;
import codewithhimanshu.hospital.entity.MedicineDispensingEntity;
import codewithhimanshu.hospital.entity.MedicineInventoryEntity;
import codewithhimanshu.hospital.entity.NursingNotesEntity;
import codewithhimanshu.hospital.entity.OpdConsultationEntity;
import codewithhimanshu.hospital.entity.OtScheduleEntity;
import codewithhimanshu.hospital.entity.PatientEntity;
import codewithhimanshu.hospital.entity.PrescriptionEntity;
import codewithhimanshu.hospital.entity.RefundEntity;
import codewithhimanshu.hospital.entity.WardEntity;
import codewithhimanshu.hospital.repository.AdvancePaymentRepository;
import codewithhimanshu.hospital.repository.BedRepository;
import codewithhimanshu.hospital.repository.DepartmentRepository;
import codewithhimanshu.hospital.repository.DischargeSummaryRepository;
import codewithhimanshu.hospital.repository.DoctorRepository;
import codewithhimanshu.hospital.repository.EmergencyRepository;
import codewithhimanshu.hospital.repository.HospitalAuditLogRepository;
import codewithhimanshu.hospital.repository.HospitalInvoiceRepository;
import codewithhimanshu.hospital.repository.HospitalPaymentRepository;
import codewithhimanshu.hospital.repository.HospitalRepository;
import codewithhimanshu.hospital.repository.HospitalStaffRepository;
import codewithhimanshu.hospital.repository.InsuranceClaimRepository;
import codewithhimanshu.hospital.repository.InvoiceItemRepository;
import codewithhimanshu.hospital.repository.IpdAdmissionRepository;
import codewithhimanshu.hospital.repository.LabTestRepository;
import codewithhimanshu.hospital.repository.MedicineDispensingRepository;
import codewithhimanshu.hospital.repository.MedicineInventoryRepository;
import codewithhimanshu.hospital.repository.NursingNotesRepository;
import codewithhimanshu.hospital.repository.OpdConsultationRepository;
import codewithhimanshu.hospital.repository.OtScheduleRepository;
import codewithhimanshu.hospital.repository.PatientRepository;
import codewithhimanshu.hospital.repository.PrescriptionRepository;
import codewithhimanshu.hospital.repository.RefundRepository;
import codewithhimanshu.hospital.repository.WardRepository;
import codewithhimanshu.workflow.event.WorkflowEventPublisher;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class HospitalManagementService {

	private final HospitalRepository hospitalRepo;
	private final DepartmentRepository deptRepo;
	private final DoctorRepository doctorRepo;
	private final PatientRepository patientRepo;
	private final WardRepository wardRepo;
	private final BedRepository bedRepo;
	private final IpdAdmissionRepository admissionRepo;
	private final OpdConsultationRepository opdRepo;
	private final PrescriptionRepository prescriptionRepo;
	private final LabTestRepository labTestRepo;
	private final MedicineInventoryRepository medicineRepo;
	private final MedicineDispensingRepository dispensingRepo;
	private final HospitalInvoiceRepository invoiceRepo;
	private final HospitalPaymentRepository paymentRepo;
	private final EmergencyRepository emergencyRepo;
	private final OtScheduleRepository otRepo;
	private final DischargeSummaryRepository dischargeRepo;
	private final NursingNotesRepository nursingRepo;
	private final InsuranceClaimRepository insuranceRepo;
	private final HospitalAuditLogRepository auditRepo;
	private final AppUserServiceImpl appUserService;
	private final HospitalStaffRepository staffRepo;
	private final AdvancePaymentRepository advanceRepo;
	private final InvoiceItemRepository invoiceItemRepo;
	private final RefundRepository refundRepo;
	private final WorkflowEventPublisher workflowEventPublisher;

	private Long getAccountId() {
		return appUserService.getLoggedInUserAccountId();
	}

	private Long getUserId() {
		try {
			return appUserService.getLoggedInUserId();
		} catch (Exception e) {
			return null;
		}
	}

	private void setWhoColumns(HospitalBaseEntity e) {
		Long accountId = getAccountId();
		Long userId = getUserId();
		e.setAccountId(accountId);
		e.setCreatedBy(userId);
		e.setUpdatedBy(userId);
		e.setIsDeleted(false);
		e.setIsActive(true);
	}

	private void setUpdateColumns(HospitalBaseEntity e) {
		e.setUpdatedBy(getUserId());
	}

	private void auditLog(String module, String action, String entityType, String entityId, String remarks) {
		try {
			HospitalAuditLogEntity log = new HospitalAuditLogEntity();
			log.setAccountId(getAccountId());
			log.setUserId(getUserId());
			log.setModule(module);
			log.setAction(action);
			log.setEntityType(entityType);
			log.setEntityId(entityId);
			log.setRemarks(remarks);
			log.setActionTime(new Date());
			auditRepo.save(log);
		} catch (Exception ex) {

			log.error("Audit log error: {}", ex.getMessage());
		}
	}

	private String generateCode(String prefix) {
		return prefix + System.currentTimeMillis();
	}

	@Transactional
	public HospitalEntity createHospital(HospitalEntity data) {
		Long accountId = getAccountId();
		if (hospitalRepo.existsByRegistrationNumberAndAccountId(data.getRegistrationNumber(), accountId)) {
			throw new IllegalArgumentException("Registration number already exists: " + data.getRegistrationNumber());
		}
		setWhoColumns(data);
		HospitalEntity saved = hospitalRepo.save(data);
		auditLog("HOSPITAL", "CREATE", "Hospital", String.valueOf(saved.getHospitalId()),
				"Hospital created: " + saved.getHospitalName());
		return saved;
	}

	public List<HospitalEntity> getAllHospitals() {
		Long accountId = getAccountId();
		if (accountId == null)
			return hospitalRepo.findByIsDeletedFalse();
		return hospitalRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public HospitalEntity getHospitalById(Long id) {
		return hospitalRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Hospital not found: " + id));
	}

	@Transactional
	public HospitalEntity updateHospital(Long id, HospitalEntity data) {
		HospitalEntity existing = getHospitalById(id);
		Long accountId = getAccountId();
		// Check reg number uniqueness only if changed
		if (!existing.getRegistrationNumber().equals(data.getRegistrationNumber())
				&& hospitalRepo.existsByRegistrationNumberAndAccountId(data.getRegistrationNumber(), accountId)) {
			throw new IllegalArgumentException("Registration number already exists: " + data.getRegistrationNumber());
		}
		data.setHospitalId(id);
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		HospitalEntity saved = hospitalRepo.save(data);
		auditLog("HOSPITAL", "UPDATE", "Hospital", String.valueOf(id), "Hospital updated");
		return saved;
	}

	@Transactional
	public void deleteHospital(Long id) {
		HospitalEntity h = getHospitalById(id);
		h.setIsDeleted(true);
		h.setIsActive(false);
		setUpdateColumns(h);
		hospitalRepo.save(h);
		auditLog("HOSPITAL", "DELETE", "Hospital", String.valueOf(id), "Hospital soft-deleted");
	}

	@Transactional
	public DepartmentEntity createDepartment(DepartmentEntity data) {
		Long accountId = getAccountId();
		// Hospital must exist
		getHospitalById(data.getHospitalId());
		if (deptRepo.existsByDeptNameAndHospitalIdAndAccountId(data.getDeptName(), data.getHospitalId(), accountId)) {
			throw new IllegalArgumentException(
					"Department name already exists in this hospital: " + data.getDeptName());
		}
		setWhoColumns(data);
		DepartmentEntity saved = deptRepo.save(data);
		auditLog("DEPARTMENT", "CREATE", "Department", String.valueOf(saved.getDeptId()),
				"Created: " + saved.getDeptName());
		return saved;
	}

	public List<DepartmentEntity> getDepartmentsByHospital(Long hospitalId) {
		Long accountId = getAccountId();
		return deptRepo.findByHospitalIdAndAccountIdAndIsDeletedFalse(hospitalId, accountId);
	}

	public List<DepartmentEntity> getAllDepartments() {
		Long accountId = getAccountId();
		return deptRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public DepartmentEntity getDepartmentById(Long id) {
		return deptRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Department not found: " + id));
	}

	@Transactional
	public DepartmentEntity updateDepartment(Long id, DepartmentEntity data) {
		DepartmentEntity existing = getDepartmentById(id);
		data.setDeptId(id);
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		auditLog("DEPARTMENT", "UPDATE", "Department", String.valueOf(id), "Updated");
		return deptRepo.save(data);
	}

	@Transactional
	public void deleteDepartment(Long id) {
		DepartmentEntity d = getDepartmentById(id);
		d.setIsDeleted(true);
		setUpdateColumns(d);
		deptRepo.save(d);
	}

	@Transactional
	public DoctorEntity createDoctor(DoctorEntity data) {
		Long accountId = getAccountId();
		if (doctorRepo.existsByMobileNumberAndAccountId(data.getMobileNumber(), accountId)) {
			throw new IllegalArgumentException("Mobile number already registered: " + data.getMobileNumber());
		}
		if (data.getHospitalId() != null) {
			getHospitalById(data.getHospitalId());
			validateDoctorBedRatio(data.getHospitalId());
		}
		setWhoColumns(data);
		if (data.getStatus() == null)
			data.setStatus("ACTIVE");
		DoctorEntity saved = doctorRepo.save(data);
		auditLog("DOCTOR", "CREATE", "Doctor", String.valueOf(saved.getDoctorId()),
				"Created: " + saved.getDoctorName());
		return saved;
	}

	private void validateDoctorBedRatio(Long hospitalId) {
		long totalBeds = bedRepo.countByHospitalIdAndBedStatus(hospitalId, "AVAILABLE")
				+ bedRepo.countByHospitalIdAndBedStatus(hospitalId, "OCCUPIED");
		long currentDoctors = doctorRepo.countByHospitalIdAndIsDeletedFalse(hospitalId);
		long requiredDoctors = totalBeds / 4;
		// This is a soft warning – not a hard block (can be enforced per business)
		if (totalBeds > 0 && currentDoctors >= requiredDoctors + 1) {
			log.info("Doctor-bed ratio acceptable for hospital {}", hospitalId);
		}
	}

	public List<DoctorEntity> getAllDoctors() {
		Long accountId = getAccountId();
		return doctorRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public List<DoctorEntity> getDoctorsByHospital(Long hospitalId) {
		Long accountId = getAccountId();
		return doctorRepo.findByHospitalIdAndAccountIdAndIsDeletedFalse(hospitalId, accountId);
	}

	public List<DoctorEntity> getDoctorsBySpecialization(String specialization) {
		Long accountId = getAccountId();
		return doctorRepo.findBySpecializationContainingIgnoreCaseAndAccountIdAndIsDeletedFalse(specialization,
				accountId);
	}

	public DoctorEntity getDoctorById(Long id) {
		return doctorRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Doctor not found: " + id));
	}

	@Transactional
	public DoctorEntity updateDoctor(Long id, DoctorEntity data) {
		DoctorEntity existing = getDoctorById(id);
		Long accountId = getAccountId();
		if (!existing.getMobileNumber().equals(data.getMobileNumber())
				&& doctorRepo.existsByMobileNumberAndAccountId(data.getMobileNumber(), accountId)) {
			throw new IllegalArgumentException("Mobile number already registered: " + data.getMobileNumber());
		}
		data.setDoctorId(id);
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		DoctorEntity saved = doctorRepo.save(data);
		auditLog("DOCTOR", "UPDATE", "Doctor", String.valueOf(id), "Updated");
		return saved;
	}

	@Transactional
	public DoctorEntity deactivateDoctor(Long id) {
		DoctorEntity d = getDoctorById(id);
		d.setStatus("INACTIVE");
		d.setIsActive(false);
		setUpdateColumns(d);
		auditLog("DOCTOR", "DEACTIVATE", "Doctor", String.valueOf(id), "Deactivated");
		return doctorRepo.save(d);
	}

	@Transactional
	public void deleteDoctor(Long id) {
		DoctorEntity d = getDoctorById(id);
		d.setIsDeleted(true);
		setUpdateColumns(d);
		doctorRepo.save(d);
	}

	@Transactional
	public PatientEntity createPatient(PatientEntity data) {
		Long accountId = getAccountId();
		if (patientRepo.existsByMobileNumberAndAccountId(data.getMobileNumber(), accountId)) {
			throw new IllegalArgumentException("Mobile number already registered: " + data.getMobileNumber());
		}
		setWhoColumns(data);
		if (data.getStatus() == null)
			data.setStatus("ACTIVE");

		data.setUhid("UHID" + System.currentTimeMillis());
		PatientEntity saved = patientRepo.save(data);
		auditLog("PATIENT", "CREATE", "Patient", String.valueOf(saved.getPatientId()),
				"Created: " + saved.getPatientName());
		return saved;
	}

	public List<PatientEntity> getAllPatients() {
		Long accountId = getAccountId();
		return patientRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public PatientEntity getPatientById(Long id) {
		return patientRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Patient not found: " + id));
	}

	public PatientEntity getPatientByUhid(String uhid) {
		return patientRepo.findByUhidAndIsDeletedFalse(uhid)
				.orElseThrow(() -> new NoSuchElementException("Patient not found with UHID: " + uhid));
	}

	public List<PatientEntity> searchPatients(String name) {
		Long accountId = getAccountId();
		return patientRepo.findByPatientNameContainingIgnoreCaseAndAccountId(name, accountId);
	}

	@Transactional
	public PatientEntity updatePatient(Long id, PatientEntity data) {
		PatientEntity existing = getPatientById(id);
		Long accountId = getAccountId();
		if (!existing.getMobileNumber().equals(data.getMobileNumber())
				&& patientRepo.existsByMobileNumberAndAccountId(data.getMobileNumber(), accountId)) {
			throw new IllegalArgumentException("Mobile number already registered: " + data.getMobileNumber());
		}
		data.setPatientId(id);
		data.setUhid(existing.getUhid());
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		PatientEntity saved = patientRepo.save(data);
		auditLog("PATIENT", "UPDATE", "Patient", String.valueOf(id), "Updated");
		return saved;
	}

	@Transactional
	public void deletePatient(Long id) {
		PatientEntity p = getPatientById(id);
		p.setIsDeleted(true);
		setUpdateColumns(p);
		patientRepo.save(p);
	}

	@Transactional
	public WardEntity createWard(WardEntity data) {
		getHospitalById(data.getHospitalId());
		setWhoColumns(data);
		if (data.getAvailableBeds() == null)
			data.setAvailableBeds(data.getTotalBeds());
		if (data.getStatus() == null)
			data.setStatus("ACTIVE");
		return wardRepo.save(data);
	}

	public List<WardEntity> getAllWards() {
		Long accountId = getAccountId();
		return wardRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public List<WardEntity> getWardsByHospital(Long hospitalId) {
		Long accountId = getAccountId();
		return wardRepo.findByHospitalIdAndAccountIdAndIsDeletedFalse(hospitalId, accountId);
	}

	public WardEntity getWardById(Long id) {
		return wardRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Ward not found: " + id));
	}

	@Transactional
	public WardEntity updateWard(Long id, WardEntity data) {
		WardEntity existing = getWardById(id);
		data.setWardId(id);
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		return wardRepo.save(data);
	}

	@Transactional
	public void deleteWard(Long id) {
		WardEntity w = getWardById(id);
		w.setIsDeleted(true);
		setUpdateColumns(w);
		wardRepo.save(w);
	}

	@Transactional
	public BedEntity createBed(BedEntity data) {
		Long accountId = getAccountId();
		getWardById(data.getWardId());
		if (bedRepo.existsByBedNumberAndWardIdAndAccountId(data.getBedNumber(), data.getWardId(), accountId)) {
			throw new IllegalArgumentException("Bed number already exists in this ward: " + data.getBedNumber());
		}
		setWhoColumns(data);
		if (data.getBedStatus() == null)
			data.setBedStatus("AVAILABLE");
		BedEntity saved = bedRepo.save(data);

		updateWardBedCount(data.getWardId());
		return saved;
	}

	public List<BedEntity> getAllBeds() {
		Long accountId = getAccountId();
		return bedRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public List<BedEntity> getBedsByWard(Long wardId) {
		Long accountId = getAccountId();
		return bedRepo.findByWardIdAndAccountIdAndIsDeletedFalse(wardId, accountId);
	}

	public List<BedEntity> getAvailableBeds(Long hospitalId) {
		Long accountId = getAccountId();
		return bedRepo.findByBedStatusAndHospitalIdAndAccountId("AVAILABLE", hospitalId, accountId);
	}

	public BedEntity getBedById(Long id) {
		return bedRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Bed not found: " + id));
	}

	@Transactional
	public BedEntity updateBed(Long id, BedEntity data) {
		BedEntity existing = getBedById(id);
		data.setBedId(id);
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		BedEntity saved = bedRepo.save(data);
		updateWardBedCount(saved.getWardId());
		return saved;
	}

	private void updateWardBedCount(Long wardId) {
		try {
			WardEntity ward = getWardById(wardId);
			Long accountId = getAccountId();
			long available = bedRepo.countByWardIdAndBedStatusAndIsDeletedFalse(wardId, "AVAILABLE");
			long total = bedRepo.countByWardIdAndIsDeletedFalse(wardId);
			ward.setAvailableBeds((int) available);
			ward.setTotalBeds((int) total);
			wardRepo.save(ward);
		} catch (Exception e) {
			log.warn("Could not update ward bed count: {}", e.getMessage());
		}
	}

	@Transactional
	public IpdAdmissionEntity createAdmission(IpdAdmissionEntity data) {
		Long accountId = getAccountId();
		PatientEntity patient = getPatientById(data.getPatientId());

		if (admissionRepo.existsByPatientIdAndAdmissionStatusAndIsDeletedFalse(data.getPatientId(), "ADMITTED")) {
			throw new IllegalArgumentException("Patient already has an active admission");
		}

		DoctorEntity doctor = getDoctorById(data.getDoctorId());
		if ("INACTIVE".equals(doctor.getStatus())) {
			throw new IllegalArgumentException("Inactive doctors cannot admit patients");
		}

		BedEntity bed = getBedById(data.getBedId());
		if (!"AVAILABLE".equals(bed.getBedStatus())) {
			throw new IllegalArgumentException("Bed is not available: " + bed.getBedNumber());
		}
		bed.setBedStatus("OCCUPIED");
		bed.setCurrentPatientId(data.getPatientId());
		setUpdateColumns(bed);
		bedRepo.save(bed);
		updateWardBedCount(bed.getWardId());

		setWhoColumns(data);
		data.setAdmissionNumber(generateCode("ADM"));
		if (data.getAdmissionDate() == null)
			data.setAdmissionDate(new Date());
		if (data.getAdmissionStatus() == null)
			data.setAdmissionStatus("ADMITTED");

		IpdAdmissionEntity saved = admissionRepo.save(data);
		bed.setCurrentAdmissionId(saved.getAdmissionId());
		bedRepo.save(bed);

		auditLog("ADMISSION", "CREATE", "IpdAdmission", String.valueOf(saved.getAdmissionId()),
				"Patient " + patient.getPatientName() + " admitted");
		try {
			workflowEventPublisher.publishEvent("PATIENT_ADMITTED", String.valueOf(saved.getAdmissionId()), "ADMISSION", Map.of("patientId", saved.getPatientId(), "doctorId", saved.getDoctorId(), "bedId", saved.getBedId()));
		} catch (Exception e) {
			log.warn("Could not fire PATIENT_ADMITTED event: {}", e.getMessage());
		}
		return saved;
	}

	public List<IpdAdmissionEntity> getAllAdmissions() {
		Long accountId = getAccountId();
		return admissionRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public List<IpdAdmissionEntity> getActiveAdmissions() {
		Long accountId = getAccountId();
		return admissionRepo.findByAdmissionStatusAndAccountIdAndIsDeletedFalse("ADMITTED", accountId);
	}

	public IpdAdmissionEntity getAdmissionById(Long id) {
		return admissionRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Admission not found: " + id));
	}

	public List<IpdAdmissionEntity> getAdmissionsByPatient(Long patientId) {
		Long accountId = getAccountId();
		return admissionRepo.findByPatientIdAndAccountIdAndIsDeletedFalse(patientId, accountId);
	}

	@Transactional
	public IpdAdmissionEntity updateAdmission(Long id, IpdAdmissionEntity data) {
		IpdAdmissionEntity existing = getAdmissionById(id);
		data.setAdmissionId(id);
		data.setAdmissionNumber(existing.getAdmissionNumber());
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		auditLog("ADMISSION", "UPDATE", "IpdAdmission", String.valueOf(id), "Updated");
		return admissionRepo.save(data);
	}

	@Transactional
	public DischargeSummaryEntity createDischargeSummary(DischargeSummaryEntity data) {
		IpdAdmissionEntity admission = getAdmissionById(data.getAdmissionId());

		List<HospitalInvoiceEntity> invoices = invoiceRepo.findByAdmissionIdAndIsDeletedFalse(data.getAdmissionId());
		boolean hasPendingBill = invoices.stream()
				.anyMatch(inv -> !"PAID".equals(inv.getPaymentStatus()) && !"CANCELLED".equals(inv.getInvoiceStatus()));
		if (hasPendingBill && !Boolean.TRUE.equals(data.getBillingCleared())) {
			throw new IllegalArgumentException("Cannot discharge: pending billing dues exist");
		}

		setWhoColumns(data);
		if (data.getDischargeDate() == null)
			data.setDischargeDate(new Date());
		if (data.getStatus() == null)
			data.setStatus("FINALIZED");

		DischargeSummaryEntity saved = dischargeRepo.save(data);

		// Release bed
		if (admission.getBedId() != null) {
			BedEntity bed = getBedById(admission.getBedId());
			bed.setBedStatus("AVAILABLE");
			bed.setCurrentPatientId(null);
			bed.setCurrentAdmissionId(null);
			setUpdateColumns(bed);
			bedRepo.save(bed);
			updateWardBedCount(bed.getWardId());
		}

		// Update admission status
		admission.setAdmissionStatus("DISCHARGED");
		admission.setDischargeDate(new Date());
		setUpdateColumns(admission);
		admissionRepo.save(admission);

		auditLog("DISCHARGE", "CREATE", "DischargeSummary", String.valueOf(saved.getDischargeId()),
				"Patient discharged from admission: " + data.getAdmissionId());
		try {
			workflowEventPublisher.publishEvent("PATIENT_DISCHARGED", String.valueOf(saved.getDischargeId()), "DISCHARGE", Map.of("admissionId", data.getAdmissionId()));
		} catch (Exception e) {
			log.warn("Could not fire PATIENT_DISCHARGED event: {}", e.getMessage());
		}
		return saved;
	}

	public List<DischargeSummaryEntity> getAllDischargeSummaries() {
		Long accountId = getAccountId();
		return dischargeRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public DischargeSummaryEntity getDischargeSummaryByAdmission(Long admissionId) {
		return dischargeRepo.findByAdmissionIdAndIsDeletedFalse(admissionId).orElseThrow(
				() -> new NoSuchElementException("Discharge summary not found for admission: " + admissionId));
	}

	public DischargeSummaryEntity getDischargeSummaryById(Long id) {
		return dischargeRepo.findById(id)
				.orElseThrow(() -> new NoSuchElementException("Discharge summary not found: " + id));
	}

	@Transactional
	public DischargeSummaryEntity updateDischargeSummary(Long id, DischargeSummaryEntity data) {
		DischargeSummaryEntity existing = getDischargeSummaryById(id);
		data.setDischargeId(id);
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		return dischargeRepo.save(data);
	}

	@Transactional
	public OpdConsultationEntity createConsultation(OpdConsultationEntity data) {
		getPatientById(data.getPatientId());
		DoctorEntity doctor = getDoctorById(data.getDoctorId());
		if ("INACTIVE".equals(doctor.getStatus())) {
			throw new IllegalArgumentException("Inactive doctors cannot conduct consultations");
		}
		setWhoColumns(data);
		data.setConsultationNumber(generateCode("OPD"));
		if (data.getConsultationDate() == null)
			data.setConsultationDate(new Date());
		if (data.getConsultationStatus() == null)
			data.setConsultationStatus("COMPLETED");
		OpdConsultationEntity saved = opdRepo.save(data);
		auditLog("OPD", "CREATE", "OpdConsultation", String.valueOf(saved.getConsultationId()), "Consultation created");
		return saved;
	}

	public List<OpdConsultationEntity> getAllConsultations() {
		Long accountId = getAccountId();
		return opdRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public OpdConsultationEntity getConsultationById(Long id) {
		return opdRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Consultation not found: " + id));
	}

	public List<OpdConsultationEntity> getConsultationsByPatient(Long patientId) {
		Long accountId = getAccountId();
		return opdRepo.findByPatientIdAndAccountIdAndIsDeletedFalse(patientId, accountId);
	}

	@Transactional
	public OpdConsultationEntity updateConsultation(Long id, OpdConsultationEntity data) {
		OpdConsultationEntity existing = getConsultationById(id);
		// Only assigned doctor can edit
		data.setConsultationId(id);
		data.setConsultationNumber(existing.getConsultationNumber());
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		auditLog("OPD", "UPDATE", "OpdConsultation", String.valueOf(id), "Updated");
		return opdRepo.save(data);
	}

	@Transactional
	public PrescriptionEntity createPrescription(PrescriptionEntity data) {
		getPatientById(data.getPatientId());
		DoctorEntity doctor = getDoctorById(data.getDoctorId());
		if ("INACTIVE".equals(doctor.getStatus())) {
			throw new IllegalArgumentException("Inactive doctors cannot create prescriptions");
		}
		if (data.getMedicines() == null || data.getMedicines().isBlank()) {
			throw new IllegalArgumentException("At least one medicine is required");
		}
		setWhoColumns(data);
		data.setPrescriptionNumber(generateCode("RX"));
		if (data.getPrescriptionDate() == null)
			data.setPrescriptionDate(new Date());
		if (data.getStatus() == null)
			data.setStatus("ACTIVE");
		PrescriptionEntity saved = prescriptionRepo.save(data);
		auditLog("PRESCRIPTION", "CREATE", "Prescription", String.valueOf(saved.getPrescriptionId()), "Created");
		return saved;
	}

	public List<PrescriptionEntity> getAllPrescriptions() {
		return prescriptionRepo.findByAccountIdAndIsDeletedFalse(getAccountId());
	}

	public List<PrescriptionEntity> getPrescriptionsByPatient(Long patientId) {
		Long accountId = getAccountId();
		return prescriptionRepo.findByPatientIdAndAccountIdAndIsDeletedFalse(patientId, accountId);
	}

	public List<PrescriptionEntity> getPrescriptionsByConsultation(Long consultationId) {
		return prescriptionRepo.findByConsultationIdAndIsDeletedFalse(consultationId);
	}

	public List<PrescriptionEntity> getPrescriptionsByAdmission(Long admissionId) {
		return prescriptionRepo.findByAdmissionIdAndIsDeletedFalse(admissionId);
	}

	public PrescriptionEntity getPrescriptionById(Long id) {
		return prescriptionRepo.findById(id)
				.orElseThrow(() -> new NoSuchElementException("Prescription not found: " + id));
	}

	@Transactional
	public PrescriptionEntity updatePrescription(Long id, PrescriptionEntity data) {
		PrescriptionEntity existing = getPrescriptionById(id);
		data.setPrescriptionId(id);
		data.setPrescriptionNumber(existing.getPrescriptionNumber());
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		auditLog("PRESCRIPTION", "UPDATE", "Prescription", String.valueOf(id), "Updated - audit tracked");
		return prescriptionRepo.save(data);
	}

	@Transactional
	public LabTestEntity createLabTest(LabTestEntity data) {
		getPatientById(data.getPatientId());
		getDoctorById(data.getDoctorId());
		setWhoColumns(data);
		data.setLabOrderNumber(generateCode("LAB"));
		if (data.getOrderedDate() == null)
			data.setOrderedDate(new Date());
		if (data.getTestStatus() == null)
			data.setTestStatus("ORDERED");
		if (data.getSampleStatus() == null)
			data.setSampleStatus("PENDING_COLLECTION");
		LabTestEntity saved = labTestRepo.save(data);
		auditLog("LAB", "CREATE", "LabTest", String.valueOf(saved.getLabTestId()),
				"Test ordered: " + data.getTestName());
		return saved;
	}

	public List<LabTestEntity> getAllLabTests() {
		Long accountId = getAccountId();
		return labTestRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public LabTestEntity getLabTestById(Long id) {
		return labTestRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Lab test not found: " + id));
	}

	public List<LabTestEntity> getLabTestsByPatient(Long patientId) {
		Long accountId = getAccountId();
		return labTestRepo.findByPatientIdAndAccountIdAndIsDeletedFalse(patientId, accountId);
	}

	@Transactional
	public LabTestEntity updateLabTest(Long id, LabTestEntity data) {
		LabTestEntity existing = getLabTestById(id);
		data.setLabTestId(id);
		data.setLabOrderNumber(existing.getLabOrderNumber());
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		return labTestRepo.save(data);
	}

	@Transactional
	public LabTestEntity uploadLabResult(Long id, String result, String resultStatus, String reportUrl) {
		LabTestEntity test = getLabTestById(id);
		test.setResult(result);
		test.setResultStatus(resultStatus);
		test.setReportUrl(reportUrl);
		test.setResultDate(new Date());
		test.setTestStatus("COMPLETED");
		test.setSampleStatus("COMPLETED");
		test.setIsCritical("CRITICAL".equals(resultStatus));
		setUpdateColumns(test);
		auditLog("LAB", "RESULT_UPLOAD", "LabTest", String.valueOf(id), "Result uploaded");
		return labTestRepo.save(test);
	}

	@Transactional
	public MedicineInventoryEntity addMedicine(MedicineInventoryEntity data) {
		setWhoColumns(data);
		// Auto-mark expired medicines
		if (data.getExpiryDate() != null && data.getExpiryDate().before(new Date())) {
			data.setIsExpired(true);
		}
		MedicineInventoryEntity saved = medicineRepo.save(data);
		auditLog("PHARMACY", "CREATE", "MedicineInventory", String.valueOf(saved.getMedicineId()),
				"Medicine added: " + data.getMedicineName());
		return saved;
	}

	public List<MedicineInventoryEntity> getAllMedicines() {
		Long accountId = getAccountId();
		return medicineRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public MedicineInventoryEntity getMedicineById(Long id) {
		return medicineRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Medicine not found: " + id));
	}

	public List<MedicineInventoryEntity> getLowStockMedicines() {
		Long accountId = getAccountId();
		return medicineRepo.findLowStockMedicines(accountId);
	}

	public List<MedicineInventoryEntity> getExpiringMedicines(int daysAhead) {
		Long accountId = getAccountId();
		Calendar cal = Calendar.getInstance();
		cal.add(Calendar.DAY_OF_MONTH, daysAhead);
		return medicineRepo.findExpiringMedicines(accountId, cal.getTime());
	}

	@Transactional
	public MedicineInventoryEntity updateMedicine(Long id, MedicineInventoryEntity data) {
		MedicineInventoryEntity existing = getMedicineById(id);
		data.setMedicineId(id);
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		return medicineRepo.save(data);
	}

	@Transactional
	public MedicineDispensingEntity dispenseMedicine(MedicineDispensingEntity data) {
		MedicineInventoryEntity medicine = getMedicineById(data.getMedicineId());
		// Business rule: expired medicines cannot be dispensed
		if (Boolean.TRUE.equals(medicine.getIsExpired())) {
			throw new IllegalArgumentException("Cannot dispense expired medicine: " + medicine.getMedicineName());
		}
		if (medicine.getQuantity() == null || medicine.getQuantity() < data.getQuantityDispensed()) {
			throw new IllegalArgumentException(
					"Insufficient stock for: " + medicine.getMedicineName() + ". Available: " + medicine.getQuantity());
		}
		// Deduct stock (FIFO)
		medicine.setQuantity(medicine.getQuantity() - data.getQuantityDispensed());
		setUpdateColumns(medicine);
		medicineRepo.save(medicine);

		setWhoColumns(data);
		data.setMedicineName(medicine.getMedicineName());
		if (data.getDispensedDate() == null)
			data.setDispensedDate(new Date());
		if (data.getStatus() == null)
			data.setStatus("DISPENSED");
		if (medicine.getSellingPrice() != null) {
			data.setTotalAmount(medicine.getSellingPrice().multiply(BigDecimal.valueOf(data.getQuantityDispensed())));
		}
		return dispensingRepo.save(data);
	}

	public List<MedicineDispensingEntity> getDispensingByPatient(Long patientId) {
		Long accountId = getAccountId();
		return dispensingRepo.findByPatientIdAndAccountIdAndIsDeletedFalse(patientId, accountId);
	}

	@Transactional
	public HospitalInvoiceEntity generateInvoice(HospitalInvoiceEntity data) {
		getPatientById(data.getPatientId());
		setWhoColumns(data);
		data.setInvoiceNumber(generateCode("INV"));
		if (data.getInvoiceDate() == null)
			data.setInvoiceDate(new Date());
		if (data.getInvoiceStatus() == null)
			data.setInvoiceStatus("GENERATED");
		if (data.getPaymentStatus() == null)
			data.setPaymentStatus("PENDING");

		// Auto-calculate subtotal
		BigDecimal sub = nullSafe(data.getConsultationCharges()).add(nullSafe(data.getRoomCharges()))
				.add(nullSafe(data.getNursingCharges())).add(nullSafe(data.getLabCharges()))
				.add(nullSafe(data.getPharmacyCharges())).add(nullSafe(data.getOtCharges()))
				.add(nullSafe(data.getEmergencyCharges())).add(nullSafe(data.getOtherCharges()));
		data.setSubtotal(sub);

		// Apply discount
		BigDecimal afterDiscount = sub.subtract(nullSafe(data.getDiscountAmount()));

		// GST
		BigDecimal gstAmt = afterDiscount.multiply(nullSafe(data.getGstPercent())).divide(BigDecimal.valueOf(100));
		data.setGstAmount(gstAmt);

		// Total
		BigDecimal total = afterDiscount.add(gstAmt);
		data.setTotalAmount(total);

		// Pending = total - advance - insurance deduction
		BigDecimal pending = total.subtract(nullSafe(data.getAdvancePaid()))
				.subtract(nullSafe(data.getInsuranceDeduction())).subtract(nullSafe(data.getPaidAmount()));
		data.setPendingAmount(pending.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : pending);

		HospitalInvoiceEntity saved = invoiceRepo.save(data);
		auditLog("BILLING", "CREATE", "Invoice", String.valueOf(saved.getInvoiceId()),
				"Invoice generated: " + saved.getInvoiceNumber());
		return saved;
	}

	private BigDecimal nullSafe(BigDecimal val) {
		return val == null ? BigDecimal.ZERO : val;
	}

	public List<HospitalInvoiceEntity> getAllInvoices() {
		Long accountId = getAccountId();
		return invoiceRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public HospitalInvoiceEntity getInvoiceById(Long id) {
		return invoiceRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Invoice not found: " + id));
	}

	public List<HospitalInvoiceEntity> getInvoicesByPatient(Long patientId) {
		Long accountId = getAccountId();
		return invoiceRepo.findByPatientIdAndAccountIdAndIsDeletedFalse(patientId, accountId);
	}

	@Transactional
	public HospitalInvoiceEntity updateInvoice(Long id, HospitalInvoiceEntity data) {
		HospitalInvoiceEntity existing = getInvoiceById(id);
		if (Boolean.TRUE.equals(existing.getIsFinal())) {
			throw new IllegalArgumentException("Cannot edit a finalized invoice");
		}
		data.setInvoiceId(id);
		data.setInvoiceNumber(existing.getInvoiceNumber());
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		return invoiceRepo.save(data);
	}

	@Transactional
	public HospitalPaymentEntity collectPayment(HospitalPaymentEntity data) {
		HospitalInvoiceEntity invoice = getInvoiceById(data.getInvoiceId());

		// Validate payment amount
		if (data.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
			throw new IllegalArgumentException("Payment amount must be greater than 0");
		}
		if (data.getAmount().compareTo(invoice.getPendingAmount()) > 0) {
			throw new IllegalArgumentException(
					"Payment amount cannot exceed pending amount: " + invoice.getPendingAmount());
		}

		setWhoColumns(data);
		data.setPaymentReference(generateCode("PAY"));
		if (data.getPaymentDate() == null)
			data.setPaymentDate(new Date());
		if (data.getPaymentStatus() == null)
			data.setPaymentStatus("SUCCESS");
		data.setReceiptNumber(generateCode("RCP"));

		HospitalPaymentEntity saved = paymentRepo.save(data);

		// Update invoice paid/pending
		BigDecimal newPaid = nullSafe(invoice.getPaidAmount()).add(data.getAmount());
		invoice.setPaidAmount(newPaid);
		BigDecimal newPending = nullSafe(invoice.getTotalAmount()).subtract(nullSafe(invoice.getAdvancePaid()))
				.subtract(nullSafe(invoice.getInsuranceDeduction())).subtract(newPaid);
		invoice.setPendingAmount(newPending.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : newPending);

		if (invoice.getPendingAmount().compareTo(BigDecimal.ZERO) == 0) {
			invoice.setPaymentStatus("PAID");
			invoice.setInvoiceStatus("PAID");
			invoice.setIsFinal(true);
		} else {
			invoice.setPaymentStatus("PARTIAL");
		}
		setUpdateColumns(invoice);
		invoiceRepo.save(invoice);

		auditLog("BILLING", "PAYMENT", "Invoice", String.valueOf(data.getInvoiceId()),
				"Payment collected: " + data.getAmount());
		return saved;
	}

	public List<HospitalPaymentEntity> getPaymentsByInvoice(Long invoiceId) {
		return paymentRepo.findByInvoiceIdAndIsDeletedFalse(invoiceId);
	}

	@Transactional
	public EmergencyEntity createEmergency(EmergencyEntity data) {
		if (data.getAssignedDoctorId() != null) {
			getDoctorById(data.getAssignedDoctorId()); // validate doctor only if provided
		}
		setWhoColumns(data);
		data.setEmergencyNumber(generateCode("EMG"));
		if (data.getArrivalTime() == null)
			data.setArrivalTime(new Date());
		if (data.getEmergencyStatus() == null)
			data.setEmergencyStatus("ACTIVE");
		EmergencyEntity saved = emergencyRepo.save(data);
		auditLog("EMERGENCY", "CREATE", "Emergency", String.valueOf(saved.getEmergencyId()), "Emergency registered");
		return saved;
	}

	public List<EmergencyEntity> getAllEmergencies() {
		Long accountId = getAccountId();
		return emergencyRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public List<EmergencyEntity> getActiveEmergencies() {
		Long accountId = getAccountId();
		return emergencyRepo.findByEmergencyStatusAndAccountId("ACTIVE", accountId);
	}

	public EmergencyEntity getEmergencyById(Long id) {
		return emergencyRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Emergency not found: " + id));
	}

	@Transactional
	public EmergencyEntity updateEmergency(Long id, EmergencyEntity data) {
		EmergencyEntity existing = getEmergencyById(id);
		data.setEmergencyId(id);
		data.setEmergencyNumber(existing.getEmergencyNumber());
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		return emergencyRepo.save(data);
	}

	@Transactional
	public OtScheduleEntity scheduleOt(OtScheduleEntity data) {
		Long accountId = getAccountId();
		getDoctorById(data.getSurgeonId());
		getPatientById(data.getPatientId());

		// Check OT room conflict
		if (data.getOtRoom() != null) {
			List<OtScheduleEntity> conflicts = otRepo.findConflictingSchedules(data.getOtRoom(), accountId,
					data.getScheduledStartTime(), data.getScheduledEndTime());
			if (!conflicts.isEmpty()) {
				throw new IllegalArgumentException("OT room " + data.getOtRoom() + " has a conflicting schedule");
			}
		}

		setWhoColumns(data);
		data.setOtNumber(generateCode("OT"));
		if (data.getOtStatus() == null)
			data.setOtStatus("SCHEDULED");
		OtScheduleEntity saved = otRepo.save(data);
		auditLog("OT", "CREATE", "OtSchedule", String.valueOf(saved.getOtId()),
				"OT scheduled: " + data.getProcedureName());
		return saved;
	}

	public List<OtScheduleEntity> getAllOtSchedules() {
		Long accountId = getAccountId();
		return otRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public OtScheduleEntity getOtById(Long id) {
		return otRepo.findById(id).orElseThrow(() -> new NoSuchElementException("OT Schedule not found: " + id));
	}

	@Transactional
	public OtScheduleEntity updateOtSchedule(Long id, OtScheduleEntity data) {
		OtScheduleEntity existing = getOtById(id);
		data.setOtId(id);
		data.setOtNumber(existing.getOtNumber());
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		return otRepo.save(data);
	}

	@Transactional
	public List<NursingNotesEntity> getAllNursingNotes() {
		Long accountId = getAccountId();
		return nursingRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public NursingNotesEntity addNursingNote(NursingNotesEntity data) {
		getAdmissionById(data.getAdmissionId());
		setWhoColumns(data);
		if (data.getRecordedAt() == null)
			data.setRecordedAt(new Date());
		return nursingRepo.save(data);
	}

	public List<NursingNotesEntity> getNursingNotesByAdmission(Long admissionId) {
		return nursingRepo.findByAdmissionIdAndIsDeletedFalse(admissionId);
	}

	@Transactional
	public InsuranceClaimEntity createInsuranceClaim(InsuranceClaimEntity data) {
		getPatientById(data.getPatientId());
		// Validate policy expiry
		if (data.getPolicyExpiry() != null && data.getPolicyExpiry().before(new Date())) {
			throw new IllegalArgumentException("Insurance policy has expired");
		}
		setWhoColumns(data);
		data.setClaimNumber(generateCode("CLM"));
		if (data.getClaimStatus() == null)
			data.setClaimStatus("PENDING");
		if (data.getClaimSubmissionDate() == null)
			data.setClaimSubmissionDate(new Date());
		InsuranceClaimEntity saved = insuranceRepo.save(data);
		auditLog("INSURANCE", "CREATE", "InsuranceClaim", String.valueOf(saved.getClaimId()), "Claim submitted");
		return saved;
	}

	public List<InsuranceClaimEntity> getAllInsuranceClaims() {
		Long accountId = getAccountId();
		return insuranceRepo.findByAccountIdAndIsDeletedFalse(accountId);
	}

	public InsuranceClaimEntity getInsuranceClaimById(Long id) {
		return insuranceRepo.findById(id)
				.orElseThrow(() -> new NoSuchElementException("Insurance claim not found: " + id));
	}

	@Transactional
	public InsuranceClaimEntity updateInsuranceClaim(Long id, InsuranceClaimEntity data) {
		InsuranceClaimEntity existing = getInsuranceClaimById(id);
		data.setClaimId(id);
		data.setClaimNumber(existing.getClaimNumber());
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		return insuranceRepo.save(data);
	}

	public Map<String, Object> getDashboardSummary() {
		Long accountId = getAccountId();
		Map<String, Object> summary = new LinkedHashMap<>();

		summary.put("totalPatients", patientRepo.findByAccountIdAndIsDeletedFalse(accountId).size());
		summary.put("totalDoctors", doctorRepo.findByAccountIdAndIsDeletedFalse(accountId).size());
		summary.put("totalHospitals", hospitalRepo.findByAccountIdAndIsDeletedFalse(accountId).size());
		summary.put("activeAdmissions",
				admissionRepo.findByAdmissionStatusAndAccountIdAndIsDeletedFalse("ADMITTED", accountId).size());
		summary.put("activeEmergencies", emergencyRepo.findByEmergencyStatusAndAccountId("ACTIVE", accountId).size());
		summary.put("pendingLabTests", labTestRepo.findByTestStatusAndAccountId("ORDERED", accountId).size());
		summary.put("lowStockMedicines", medicineRepo.findLowStockMedicines(accountId).size());
		summary.put("totalRevenue", invoiceRepo.sumTotalRevenue(accountId));
		summary.put("pendingDues", invoiceRepo.sumPendingAmount(accountId));
		summary.put("pendingInsuranceClaims",
				insuranceRepo.findByClaimStatusAndAccountIdAndIsDeletedFalse("PENDING", accountId).size());

		return summary;
	}

	public List<HospitalAuditLogEntity> getAuditLogs() {
		Long accountId = getAccountId();
		return auditRepo.findByAccountIdOrderByActionTimeDesc(accountId);
	}

	public List<HospitalAuditLogEntity> getAuditLogsByModule(String module) {
		Long accountId = getAccountId();
		return auditRepo.findByAccountIdAndModuleOrderByActionTimeDesc(accountId, module);
	}

	@Transactional
	public HospitalStaffEntity createStaff(HospitalStaffEntity data) {
		Long accountId = getAccountId();
		if (staffRepo.existsByMobileNumberAndAccountId(data.getMobileNumber(), accountId)) {
			throw new IllegalArgumentException("Mobile number already registered: " + data.getMobileNumber());
		}
		setWhoColumns(data);
		data.setStaffCode(generateCode("STF"));
		HospitalStaffEntity saved = staffRepo.save(data);
		auditLog("STAFF", "CREATE", "Staff", String.valueOf(saved.getStaffId()),
				"Staff created: " + saved.getStaffName());
		return saved;
	}

	public List<HospitalStaffEntity> getAllStaff() {
		return staffRepo.findByAccountIdAndIsDeletedFalse(getAccountId());
	}

	public List<HospitalStaffEntity> getStaffByHospital(Long hospitalId) {
		return staffRepo.findByHospitalIdAndAccountIdAndIsDeletedFalse(hospitalId, getAccountId());
	}

	public List<HospitalStaffEntity> getStaffByRole(String role) {
		return staffRepo.findByStaffRoleAndAccountIdAndIsDeletedFalse(role, getAccountId());
	}

	public HospitalStaffEntity getStaffById(Long id) {
		return staffRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Staff not found: " + id));
	}

	@Transactional
	public HospitalStaffEntity updateStaff(Long id, HospitalStaffEntity data) {
		HospitalStaffEntity existing = getStaffById(id);
		Long accountId = getAccountId();
		if (!existing.getMobileNumber().equals(data.getMobileNumber())
				&& staffRepo.existsByMobileNumberAndAccountId(data.getMobileNumber(), accountId)) {
			throw new IllegalArgumentException("Mobile number already registered: " + data.getMobileNumber());
		}
		data.setStaffId(id);
		data.setAccountId(existing.getAccountId());
		data.setCreatedBy(existing.getCreatedBy());
		data.setCreatedAt(existing.getCreatedAt());
		data.setStaffCode(existing.getStaffCode());
		data.setIsDeleted(false);
		setUpdateColumns(data);
		auditLog("STAFF", "UPDATE", "Staff", String.valueOf(id), "Staff updated");
		return staffRepo.save(data);
	}

	@Transactional
	public void deleteStaff(Long id) {
		HospitalStaffEntity s = getStaffById(id);
		s.setIsDeleted(true);
		s.setIsActive(false);
		setUpdateColumns(s);
		staffRepo.save(s);
		auditLog("STAFF", "DELETE", "Staff", String.valueOf(id), "Staff soft-deleted");
	}

	@Transactional
	public AdvancePaymentEntity collectAdvancePayment(AdvancePaymentEntity data) {
		Long accountId = getAccountId();
		setWhoColumns(data);
		data.setAdvanceReference(generateCode("ADV"));
		data.setBalanceAmount(data.getAmount()); // initially fully available
		data.setAdjustedAmount(BigDecimal.ZERO);
		if (data.getAdvanceStatus() == null)
			data.setAdvanceStatus("PENDING");
		AdvancePaymentEntity saved = advanceRepo.save(data);
		auditLog("BILLING", "ADVANCE_COLLECTED", "AdvancePayment", String.valueOf(saved.getAdvanceId()),
				"Advance collected: " + saved.getAmount());
		return saved;
	}

	public List<AdvancePaymentEntity> getAllAdvancePayments() {
		return advanceRepo.findByAccountIdAndIsDeletedFalse(getAccountId());
	}

	public List<AdvancePaymentEntity> getAdvancesByPatient(Long patientId) {
		return advanceRepo.findByPatientIdAndAccountIdAndIsDeletedFalse(patientId, getAccountId());
	}

	public List<AdvancePaymentEntity> getAdvancesByAdmission(Long admissionId) {
		return advanceRepo.findByAdmissionIdAndIsDeletedFalse(admissionId);
	}

	public AdvancePaymentEntity getAdvanceById(Long id) {
		return advanceRepo.findById(id)
				.orElseThrow(() -> new NoSuchElementException("Advance payment not found: " + id));
	}

	@Transactional
	public AdvancePaymentEntity adjustAdvanceAgainstInvoice(Long advanceId, Long invoiceId,
			java.math.BigDecimal adjustAmount) {
		AdvancePaymentEntity advance = getAdvanceById(advanceId);
		if (advance.getBalanceAmount().compareTo(adjustAmount) < 0) {
			throw new IllegalArgumentException("Adjustment amount exceeds available advance balance.");
		}
		advance.setAdjustedAmount(advance.getAdjustedAmount().add(adjustAmount));
		advance.setBalanceAmount(advance.getBalanceAmount().subtract(adjustAmount));
		advance.setInvoiceId(invoiceId);
		if (advance.getBalanceAmount().compareTo(BigDecimal.ZERO) == 0) {
			advance.setAdvanceStatus("ADJUSTED");
		} else {
			advance.setAdvanceStatus("PARTIALLY_ADJUSTED");
		}
		setUpdateColumns(advance);
		auditLog("BILLING", "ADVANCE_ADJUSTED", "AdvancePayment", String.valueOf(advanceId),
				"Adjusted " + adjustAmount + " against invoice " + invoiceId);
		return advanceRepo.save(advance);
	}

	@Transactional
	public InvoiceItemEntity addInvoiceItem(InvoiceItemEntity item) {
		setWhoColumns(item);

		java.math.BigDecimal base = item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity()));
		item.setTotalPrice(base);
		java.math.BigDecimal afterDiscount = base
				.subtract(item.getDiscountAmount() != null ? item.getDiscountAmount() : BigDecimal.ZERO);
		java.math.BigDecimal gst = afterDiscount
				.multiply(item.getGstPercent() != null ? item.getGstPercent().divide(java.math.BigDecimal.valueOf(100))
						: BigDecimal.ZERO);
		item.setGstAmount(gst);
		item.setNetAmount(afterDiscount.add(gst));
		return invoiceItemRepo.save(item);
	}

	public List<InvoiceItemEntity> getItemsByInvoice(Long invoiceId) {
		return invoiceItemRepo.findByInvoiceIdAndIsDeletedFalse(invoiceId);
	}

	@Transactional
	public void deleteInvoiceItem(Long itemId) {
		InvoiceItemEntity item = invoiceItemRepo.findById(itemId)
				.orElseThrow(() -> new NoSuchElementException("Invoice item not found: " + itemId));
		item.setIsDeleted(true);
		setUpdateColumns(item);
		invoiceItemRepo.save(item);
	}

	@Transactional
	public RefundEntity initiateRefund(RefundEntity data) {
		setWhoColumns(data);
		data.setRefundReference(generateCode("RFD"));
		data.setRefundStatus("PENDING_APPROVAL");
		data.setIsProcessed(false);
		data.setRequestedDate(new Date());
		RefundEntity saved = refundRepo.save(data);
		auditLog("BILLING", "REFUND_INITIATED", "Refund", String.valueOf(saved.getRefundId()),
				"Refund initiated: " + saved.getRefundAmount());
		return saved;
	}

	@Transactional
	public RefundEntity approveRefund(Long refundId, String approvedBy, String remarks) {
		RefundEntity refund = refundRepo.findById(refundId)
				.orElseThrow(() -> new NoSuchElementException("Refund not found: " + refundId));
		if ("PROCESSED".equals(refund.getRefundStatus())) {
			throw new IllegalStateException("Refund already processed and is immutable.");
		}
		refund.setRefundStatus("APPROVED");
		refund.setApprovedBy(approvedBy);
		refund.setApprovalRemarks(remarks);
		setUpdateColumns(refund);
		auditLog("BILLING", "REFUND_APPROVED", "Refund", String.valueOf(refundId), "Approved by: " + approvedBy);
		return refundRepo.save(refund);
	}

	@Transactional
	public RefundEntity processRefund(Long refundId, String transactionId) {
		RefundEntity refund = refundRepo.findById(refundId)
				.orElseThrow(() -> new NoSuchElementException("Refund not found: " + refundId));
		if (!"APPROVED".equals(refund.getRefundStatus())) {
			throw new IllegalStateException("Refund must be approved before processing.");
		}
		if (Boolean.TRUE.equals(refund.getIsProcessed())) {
			throw new IllegalStateException("Refund already processed and is immutable.");
		}
		refund.setRefundStatus("PROCESSED");
		refund.setIsProcessed(true);
		refund.setTransactionId(transactionId);
		refund.setProcessedDate(new Date());
		setUpdateColumns(refund);
		auditLog("BILLING", "REFUND_PROCESSED", "Refund", String.valueOf(refundId),
				"Processed with txn: " + transactionId);
		return refundRepo.save(refund);
	}

	public List<RefundEntity> getAllRefunds() {
		return refundRepo.findByAccountIdAndIsDeletedFalse(getAccountId());
	}

	public List<RefundEntity> getRefundsByPatient(Long patientId) {
		return refundRepo.findByPatientIdAndAccountIdAndIsDeletedFalse(patientId, getAccountId());
	}

	public RefundEntity getRefundById(Long id) {
		return refundRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Refund not found: " + id));
	}

	@Transactional
	public IpdAdmissionEntity transferBed(Long admissionId, Long newBedId, String reason) {
		IpdAdmissionEntity admission = getAdmissionById(admissionId);
		if (!"ADMITTED".equals(admission.getAdmissionStatus())) {
			throw new IllegalStateException("Patient is not currently admitted.");
		}
		BedEntity newBed = getBedById(newBedId);
		if (!"AVAILABLE".equals(newBed.getBedStatus())) {
			throw new IllegalStateException("Target bed is not available.");
		}

		// Release old bed
		BedEntity oldBed = getBedById(admission.getBedId());
		oldBed.setBedStatus("AVAILABLE");
		oldBed.setCurrentPatientId(null);
		oldBed.setCurrentAdmissionId(null);
		bedRepo.save(oldBed);

		// Occupy new bed
		newBed.setBedStatus("OCCUPIED");
		newBed.setCurrentPatientId(admission.getPatientId());
		newBed.setCurrentAdmissionId(admissionId);
		bedRepo.save(newBed);

		// Update admission
		admission.setBedId(newBedId);
		admission.setWardId(newBed.getWardId());
		setUpdateColumns(admission);
		IpdAdmissionEntity updated = admissionRepo.save(admission);

		auditLog("IPD", "BED_TRANSFER", "Admission", String.valueOf(admissionId),
				"Bed transferred to " + newBedId + ". Reason: " + reason);
		return updated;
	}

	@Transactional
	public IpdAdmissionEntity convertEmergencyToAdmission(Long emergencyId, IpdAdmissionEntity admissionData) {
		EmergencyEntity emergency = getEmergencyById(emergencyId);
		if (Boolean.TRUE.equals(emergency.getConvertedToAdmission())) {
			throw new IllegalStateException("Emergency already converted to admission.");
		}
		admissionData.setAdmissionType("EMERGENCY");
		admissionData.setPriority("CRITICAL");
		if (admissionData.getPatientId() == null) {
			admissionData.setPatientId(emergency.getPatientId());
		}
		IpdAdmissionEntity admission = createAdmission(admissionData);

		emergency.setConvertedToAdmission(true);
		emergency.setAdmissionId(admission.getAdmissionId());
		emergency.setEmergencyStatus("ADMITTED");
		setUpdateColumns(emergency);
		emergencyRepo.save(emergency);

		auditLog("EMERGENCY", "CONVERTED_TO_ADMISSION", "Emergency", String.valueOf(emergencyId),
				"Converted to admission: " + admission.getAdmissionNumber());
		return admission;
	}

	@Transactional
	public HospitalInvoiceEntity finalizeInvoice(Long invoiceId) {
		HospitalInvoiceEntity invoice = getInvoiceById(invoiceId);
		if (Boolean.TRUE.equals(invoice.getIsFinal())) {
			throw new IllegalStateException("Invoice is already finalised.");
		}
		invoice.setIsFinal(true);
		invoice.setInvoiceStatus("FINALIZED");
		setUpdateColumns(invoice);
		auditLog("BILLING", "INVOICE_FINALIZED", "Invoice", String.valueOf(invoiceId), "Invoice finalised");
		return invoiceRepo.save(invoice);
	}

	public List<MedicineInventoryEntity> searchMedicinesByName(String name) {
		return medicineRepo.findByMedicineNameContainingIgnoreCaseAndAccountIdAndIsDeletedFalse(name, getAccountId());
	}

}