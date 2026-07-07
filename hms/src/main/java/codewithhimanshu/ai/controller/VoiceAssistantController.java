package codewithhimanshu.ai.controller;

import codewithhimanshu.ai.dto.VoiceRequestDto;
import codewithhimanshu.ai.dto.VoiceResponseDto;
import codewithhimanshu.ai.entity.VoiceCommandHistory;
import codewithhimanshu.ai.service.VoiceAssistantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/voice")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VoiceAssistantController {

    private final VoiceAssistantService voiceAssistantService;

    @PostMapping("/process")
    public ResponseEntity<VoiceResponseDto> processVoiceCommand(@RequestBody VoiceRequestDto request) {
        log.info("Received voice command request: {}", request.getMessage());
        VoiceResponseDto response = voiceAssistantService.processVoiceCommand(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<VoiceCommandHistory>> getVoiceHistory() {
        return ResponseEntity.ok(voiceAssistantService.getUserVoiceHistory());
    }
}
