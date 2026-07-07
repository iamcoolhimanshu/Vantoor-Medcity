package codewithhimanshu.ai.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineRecommendationRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;
    private List<String> symptoms;
    private String diagnosis;
}
