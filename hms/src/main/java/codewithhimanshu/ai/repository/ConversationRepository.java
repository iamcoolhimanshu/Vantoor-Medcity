package codewithhimanshu.ai.repository;

import codewithhimanshu.ai.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findBySessionIdOrderByCreatedAtAsc(String sessionId);
}
