package codewithhimanshu.ai.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineRecommendationResponse {
    private List<MedicineDTO> recommendations;
    private List<WarningDTO> warnings;
    private String reasoning;
}
