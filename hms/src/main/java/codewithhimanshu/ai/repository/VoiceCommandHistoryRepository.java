package codewithhimanshu.ai.repository;

import codewithhimanshu.ai.entity.VoiceCommandHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoiceCommandHistoryRepository extends JpaRepository<VoiceCommandHistory, Long> {
    List<VoiceCommandHistory> findTop20ByUserIdOrderByIdDesc(Long userId);
    List<VoiceCommandHistory> findTop20ByOrderByIdDesc();
}
