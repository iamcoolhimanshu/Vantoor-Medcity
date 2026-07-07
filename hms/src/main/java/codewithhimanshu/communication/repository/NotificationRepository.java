package codewithhimanshu.communication.repository;

import codewithhimanshu.communication.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);
    List<NotificationEntity> findByUserIdAndStatusAndIsDeletedFalseOrderByCreatedAtDesc(Long userId, String status);
    long countByUserIdAndStatusAndIsDeletedFalse(Long userId, String status);
}
