package codewithhimanshu.ai.controller;

import codewithhimanshu.ai.dto.AIChatRequest;
import codewithhimanshu.ai.dto.AIChatResponse;
import codewithhimanshu.ai.service.AIChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import codewithhimanshu.ai.entity.Conversation;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin("*")
@Tag(name = "AI Chatbot")
public class AIChatController {

    @Autowired
    private AIChatService chatService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/chat")
    @Operation(summary = "Send a message to the AI Appointment Chatbot")
    public ResponseEntity<AIChatResponse> chat(@RequestBody AIChatRequest request) {
        if (request.getSessionId() == null || request.getSessionId().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        AIChatResponse response = chatService.processChatMessage(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{sessionId}")
    @Operation(summary = "Get conversation history for a session")
    public ResponseEntity<List<AIChatResponse>> getHistory(@PathVariable String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Conversation> history = chatService.getConversationHistory(sessionId);
        List<AIChatResponse> responseList = new ArrayList<>();
        
        for (Conversation c : history) {
            if ("assistant".equals(c.getRole())) {
                try {
                    AIChatResponse resp = objectMapper.readValue(c.getMessage(), AIChatResponse.class);
                    responseList.add(resp);
                } catch (Exception e) {
                    responseList.add(AIChatResponse.builder()
                            .reply(c.getMessage())
                            .action("GENERAL_QUERY")
                            .data(new HashMap<>())
                            .build());
                }
            } else {
                responseList.add(AIChatResponse.builder()
                        .reply(c.getMessage())
                        .action("USER_MESSAGE")
                        .data(new HashMap<>())
                        .build());
            }
        }
        
        return ResponseEntity.ok(responseList);
    }
}
