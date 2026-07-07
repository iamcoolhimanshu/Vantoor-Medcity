package codewithhimanshu.communication.controller;

import codewithhimanshu.communication.entity.EmailAttachmentEntity;
import codewithhimanshu.communication.entity.EmailMessageEntity;
import codewithhimanshu.communication.service.CommunicationService;
import codewithhimanshu.hospital.entity.DoctorEntity;
import codewithhimanshu.hospital.entity.HospitalStaffEntity;
import codewithhimanshu.hospital.entity.PatientEntity;
import codewithhimanshu.hospital.repository.DoctorRepository;
import codewithhimanshu.hospital.repository.HospitalStaffRepository;
import codewithhimanshu.hospital.repository.PatientRepository;
import codewithhimanshu.hospital.security.AppUserEntity;
import codewithhimanshu.hospital.security.AppUserRepository;
import codewithhimanshu.hospital.service.AppUserServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/email")
@CrossOrigin("*")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Email & Messaging Hub")
public class EmailController {

    private final CommunicationService commService;
    private final DoctorRepository doctorRepo;
    private final HospitalStaffRepository staffRepo;
    private final PatientRepository patientRepo;
    private final AppUserRepository userRepo;
    private final AppUserServiceImpl appUserService;

    // Save folder for uploads
    private static final String UPLOAD_DIR = "uploads/";

    // ─────────────────────────────────────────────────────────────
    // Message Flows
    // ─────────────────────────────────────────────────────────────

    @PostMapping("/send")
    @Operation(summary = "Send internal message")
    public ResponseEntity<EmailMessageEntity> sendEmail(@RequestBody SendEmailRequest req) {
        EmailMessageEntity email = EmailMessageEntity.builder()
                .receiverId(req.getReceiverId())
                .subject(req.getSubject())
                .message(req.getMessage())
                .priority(req.getPriority())
                .category(req.getCategory())
                .recipientGroup(req.getRecipientGroup())
                .status("SENT")
                .build();
        return ResponseEntity.ok(commService.sendEmail(email, req.getFileUrls()));
    }

    @PostMapping("/send-bulk")
    @Operation(summary = "Send email template to bulk list of recipients")
    public ResponseEntity<List<EmailMessageEntity>> sendBulkEmail(@RequestBody SendBulkRequest req) {
        EmailMessageEntity template = EmailMessageEntity.builder()
                .subject(req.getSubject())
                .message(req.getMessage())
                .priority(req.getPriority())
                .category(req.getCategory())
                .build();
        return ResponseEntity.ok(commService.sendBulkEmail(template, req.getReceiverIds()));
    }

    @GetMapping("/inbox")
    @Operation(summary = "Get current user's inbox")
    public ResponseEntity<List<EmailMessageEntity>> getInbox() {
        return ResponseEntity.ok(commService.getInbox());
    }

    @GetMapping("/sent")
    @Operation(summary = "Get current user's sent folder")
    public ResponseEntity<List<EmailMessageEntity>> getSent() {
        return ResponseEntity.ok(commService.getSent());
    }

    @GetMapping("/starred")
    @Operation(summary = "Get current user's starred emails")
    public ResponseEntity<List<EmailMessageEntity>> getStarred() {
        return ResponseEntity.ok(commService.getStarred());
    }

    @GetMapping("/trash")
    @Operation(summary = "Get current user's trash folder")
    public ResponseEntity<List<EmailMessageEntity>> getTrashed() {
        return ResponseEntity.ok(commService.getTrashed());
    }

    @GetMapping("/archive")
    @Operation(summary = "Get current user's archived folder")
    public ResponseEntity<List<EmailMessageEntity>> getArchived() {
        return ResponseEntity.ok(commService.getArchived());
    }

    @GetMapping("/unread")
    @Operation(summary = "Get current user's unread inbox count")
    public ResponseEntity<Map<String, Long>> getUnread() {
        return ResponseEntity.ok(Map.of("unreadCount", commService.getUnreadCount()));
    }

    @PostMapping("/star")
    @Operation(summary = "Toggle star state on email")
    public ResponseEntity<Void> toggleStar(@RequestParam Long emailId) {
        commService.toggleStar(emailId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/archive")
    @Operation(summary = "Toggle archive state on email")
    public ResponseEntity<Void> toggleArchive(@RequestParam Long emailId) {
        commService.toggleArchive(emailId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/delete")
    @Operation(summary = "Soft delete email (sends to trash, or hard deletes if already in trash)")
    public ResponseEntity<Void> deleteEmail(@RequestParam Long emailId) {
        commService.deleteEmail(emailId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mark-read")
    @Operation(summary = "Mark email as read")
    public ResponseEntity<Void> markAsRead(@RequestParam Long emailId) {
        commService.markAsRead(emailId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/attachments")
    @Operation(summary = "Get attachments for an email")
    public ResponseEntity<List<EmailAttachmentEntity>> getAttachments(@PathVariable Long id) {
        return ResponseEntity.ok(commService.getAttachments(id));
    }

    // ─────────────────────────────────────────────────────────────
    // User / Recipient List Retrieval
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/recipients")
    @Operation(summary = "Get all users in system grouped by role to compose messages")
    public ResponseEntity<Map<String, List<RecipientDto>>> getRecipients() {
        Long accountId = appUserService.getLoggedInUserAccountId();

        // 1. Doctors
        List<DoctorEntity> doctors = doctorRepo.findByAccountIdAndIsDeletedFalse(accountId);
        List<RecipientDto> docDtos = new ArrayList<>();
        for (DoctorEntity doc : doctors) {
            AppUserEntity docUser = userRepo.findByUsername(doc.getEmail() != null ? doc.getEmail() : doc.getMobileNumber()).orElse(null);
            if (docUser != null) {
                docDtos.add(new RecipientDto(docUser.getUserId(), "Dr. " + doc.getDoctorName(), doc.getEmail(), "DOCTOR"));
            }
        }

        // 2. Staff (Nurses, Receptionists, Pharmacists, Ward Managers, Lab techs)
        List<HospitalStaffEntity> staff = staffRepo.findByAccountIdAndIsDeletedFalse(accountId);
        List<RecipientDto> staffDtos = new ArrayList<>();
        for (HospitalStaffEntity st : staff) {
            AppUserEntity stUser = userRepo.findByUsername(st.getEmail() != null ? st.getEmail() : st.getMobileNumber()).orElse(null);
            if (stUser != null) {
                staffDtos.add(new RecipientDto(stUser.getUserId(), st.getStaffName(), st.getEmail(), st.getStaffRole()));
            }
        }

        // 3. Patients
        List<PatientEntity> patients = patientRepo.findByAccountIdAndIsDeletedFalse(accountId);
        List<RecipientDto> patientDtos = new ArrayList<>();
        for (PatientEntity p : patients) {
            AppUserEntity pUser = userRepo.findByUsername(p.getEmail() != null ? p.getEmail() : p.getMobileNumber()).orElse(null);
            if (pUser != null) {
                patientDtos.add(new RecipientDto(pUser.getUserId(), p.getPatientName(), p.getEmail(), "PATIENT"));
            }
        }

        Map<String, List<RecipientDto>> map = new HashMap<>();
        map.put("DOCTORS", docDtos);
        map.put("STAFF", staffDtos);
        map.put("PATIENTS", patientDtos);

        return ResponseEntity.ok(map);
    }

    // ─────────────────────────────────────────────────────────────
    // Interactive Availability / Doctor Actions
    // ─────────────────────────────────────────────────────────────

    @PostMapping("/respond-availability")
    @Operation(summary = "Doctor response to schedule availability card (Accept/Reject)")
    public ResponseEntity<Void> respondAvailability(@RequestParam Long emailId, @RequestParam boolean accept) {
        commService.respondToDoctorAvailability(emailId, accept);
        return ResponseEntity.ok().build();
    }

    // ─────────────────────────────────────────────────────────────
    // File Storage and Attachment Download
    // ─────────────────────────────────────────────────────────────

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload file attachment")
    public ResponseEntity<Map<String, String>> uploadAttachment(@RequestParam("file") MultipartFile file) {
        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String origName = file.getOriginalFilename();
            String cleanName = System.currentTimeMillis() + "_" + (origName != null ? origName.replaceAll("\\s+", "_") : "attachment");
            Path targetPath = Paths.get(UPLOAD_DIR + cleanName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "http://localhost:7765/api/email/attachments/" + cleanName;
            return ResponseEntity.ok(Map.of("fileUrl", fileUrl, "fileName", origName != null ? origName : cleanName));
        } catch (IOException e) {
            log.error("Attachment upload failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "File upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/attachments/{filename:.+}")
    @Operation(summary = "Retrieve file attachment")
    public ResponseEntity<Resource> getAttachmentFile(@PathVariable String filename) {
        try {
            Path file = Paths.get(UPLOAD_DIR).resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Failed to read file: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // AI Endpoint Direct Invocations
    // ─────────────────────────────────────────────────────────────

    @PostMapping("/ai/generate")
    @Operation(summary = "Generate professional email body using AI")
    public ResponseEntity<Map<String, String>> generateEmailAI(@RequestBody Map<String, String> requestBody) {
        String prompt = requestBody.get("prompt");
        String resultJson = commService.generateEmailAI(prompt);
        return ResponseEntity.ok(Map.of("data", resultJson));
    }

    @PostMapping("/ai/reply")
    @Operation(summary = "Generate AI Smart Replies based on email thread")
    public ResponseEntity<Map<String, String>> generateSmartReplyAI(@RequestBody Map<String, String> requestBody) {
        String content = requestBody.get("emailContent");
        String resultJson = commService.generateSmartReplyAI(content);
        return ResponseEntity.ok(Map.of("data", resultJson));
    }

    @PostMapping("/ai/priority")
    @Operation(summary = "Detect priority class using AI")
    public ResponseEntity<Map<String, String>> detectPriorityAI(@RequestBody Map<String, String> requestBody) {
        String subject = requestBody.get("subject");
        String content = requestBody.get("content");
        String result = commService.detectPriorityAI(subject, content);
        return ResponseEntity.ok(Map.of("priority", result));
    }

    @PostMapping("/ai/route")
    @Operation(summary = "AI Routing tag based on content")
    public ResponseEntity<Map<String, String>> routeDepartmentAI(@RequestBody Map<String, String> requestBody) {
        String content = requestBody.get("content");
        String result = commService.routeDepartmentAI(content);
        return ResponseEntity.ok(Map.of("category", result));
    }

    // ─────────────────────────────────────────────────────────────
    // DTO Classes
    // ─────────────────────────────────────────────────────────────

    @Data
    public static class SendEmailRequest {
        private Long receiverId;
        private String subject;
        private String message;
        private String priority;
        private String category;
        private String recipientGroup;
        private List<String> fileUrls;
    }

    @Data
    public static class SendBulkRequest {
        private List<Long> receiverIds;
        private String subject;
        private String message;
        private String priority;
        private String category;
    }

    @Data
    @AllArgsConstructor
    public static class RecipientDto {
        private Long userId;
        private String name;
        private String email;
        private String role;
    }
}
