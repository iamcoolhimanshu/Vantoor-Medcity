package codewithhimanshu.communication.controller;

import codewithhimanshu.communication.entity.AvailabilityStatusEntity;
import codewithhimanshu.communication.service.CommunicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin("*")
@RequiredArgsConstructor
@Tag(name = "Staff Availability Management")
public class AvailabilityController {

    private final CommunicationService commService;

    @PostMapping("/update")
    @Operation(summary = "Update current user's availability status")
    public ResponseEntity<AvailabilityStatusEntity> updateAvailability(@RequestParam String status) {
        return ResponseEntity.ok(commService.updateAvailability(status.toUpperCase()));
    }

    @GetMapping("/all")
    @Operation(summary = "Get live availability board of all doctors and staff")
    public ResponseEntity<List<Map<String, Object>>> getLiveAvailabilityBoard() {
        return ResponseEntity.ok(commService.getLiveAvailabilityBoard());
    }
}
