package codewithhimanshu.ai.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoiceResponseDto {
    private String reply;
    private String intent;
    private Boolean actionCompleted;
    private Object data;
    private List<String> suggestedActions;
    private String navigationTarget;
}
