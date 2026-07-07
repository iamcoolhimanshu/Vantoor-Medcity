package codewithhimanshu.ai.repository;

import codewithhimanshu.ai.entity.RecommendationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecommendationHistoryRepository extends JpaRepository<RecommendationHistory, Long> {
    List<RecommendationHistory> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
