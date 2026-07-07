package codewithhimanshu.communication.controller;

import codewithhimanshu.communication.entity.AnnouncementEntity;
import codewithhimanshu.communication.service.CommunicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcement")
@CrossOrigin("*")
@RequiredArgsConstructor
@Tag(name = "Hospital Announcements")
public class AnnouncementController {

    private final CommunicationService commService;

    @PostMapping("/create")
    @Operation(summary = "Publish a new hospital announcement")
    public ResponseEntity<AnnouncementEntity> createAnnouncement(@RequestBody AnnouncementEntity announcement) {
        return ResponseEntity.ok(commService.createAnnouncement(announcement));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all active hospital announcements")
    public ResponseEntity<List<AnnouncementEntity>> getAllAnnouncements() {
        return ResponseEntity.ok(commService.getAllAnnouncements());
    }

    @PostMapping("/ai/generate")
    @Operation(summary = "Generate professional announcement text using AI")
    public ResponseEntity<Map<String, String>> generateAnnouncementAI(@RequestBody Map<String, String> requestBody) {
        String prompt = requestBody.get("prompt");
        String resultJson = commService.generateAnnouncementAI(prompt);
        return ResponseEntity.ok(Map.of("data", resultJson));
    }
}
