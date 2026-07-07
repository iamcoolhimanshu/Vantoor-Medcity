package codewithhimanshu.communication.repository;

import codewithhimanshu.communication.entity.EmailAttachmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailAttachmentRepository extends JpaRepository<EmailAttachmentEntity, Long> {
    List<EmailAttachmentEntity> findByEmailId(Long emailId);
}
