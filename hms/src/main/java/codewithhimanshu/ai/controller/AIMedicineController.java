package codewithhimanshu.ai.controller;

import codewithhimanshu.ai.dto.MedicineRecommendationRequest;
import codewithhimanshu.ai.dto.MedicineRecommendationResponse;
import codewithhimanshu.ai.entity.RecommendationHistory;
import codewithhimanshu.ai.service.AIMedicineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/ai/medicine")
@CrossOrigin("*")
@RequiredArgsConstructor
@Tag(name = "AI Medicine Recommendation", description = "AI assisted medicine recommendation system for doctors")
public class AIMedicineController {

    private final AIMedicineService medicineService;

    @PostMapping("/recommend")
    @Operation(summary = "Get AI medicine recommendations based on symptoms, diagnosis and patient context")
    public ResponseEntity<MedicineRecommendationResponse> recommendMedicines(
            @Valid @RequestBody MedicineRecommendationRequest request) {
        if (request.getPatientId() == null) {
            return ResponseEntity.badRequest().build();
        }
        MedicineRecommendationResponse response = medicineService.recommendMedicines(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{patientId}")
    @Operation(summary = "Get medicine recommendation logs/history for a patient")
    public ResponseEntity<List<RecommendationHistory>> getRecommendationHistory(@PathVariable Long patientId) {
        if (patientId == null) {
            return ResponseEntity.badRequest().build();
        }
        List<RecommendationHistory> history = medicineService.getRecommendationHistory(patientId);
        return ResponseEntity.ok(history);
    }
}
