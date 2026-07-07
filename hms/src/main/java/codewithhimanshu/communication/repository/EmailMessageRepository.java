package codewithhimanshu.communication.repository;

import codewithhimanshu.communication.entity.EmailMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailMessageRepository extends JpaRepository<EmailMessageEntity, Long> {

    // Inbox Query: Messages sent to this user OR sent to a group/role they are part of, which are not deleted/archived
    @Query("SELECT m FROM EmailMessageEntity m WHERE " +
           "((m.receiverId = :userId) OR " +
           "(m.recipientGroup IS NOT NULL AND :userRoles IS NOT NULL AND m.recipientGroup IN :userRoles)) " +
           "AND m.status = 'SENT' " +
           "AND m.isDeletedByReceiver = false " +
           "AND m.isArchivedByReceiver = false " +
           "ORDER BY m.createdAt DESC")
    List<EmailMessageEntity> findInboxMessages(@Param("userId") Long userId, @Param("userRoles") List<String> userRoles);

    // Sent/Draft Query: Messages sent/drafted by this user, which are not deleted
    List<EmailMessageEntity> findBySenderIdAndStatusAndIsDeletedBySenderFalseOrderByCreatedAtDesc(Long senderId, String status);

    // Unread count for Inbox
    @Query("SELECT COUNT(m) FROM EmailMessageEntity m WHERE " +
           "((m.receiverId = :userId) OR " +
           "(m.recipientGroup IS NOT NULL AND :userRoles IS NOT NULL AND m.recipientGroup IN :userRoles)) " +
           "AND m.status = 'SENT' " +
           "AND m.isRead = false " +
           "AND m.isDeletedByReceiver = false " +
           "AND m.isArchivedByReceiver = false")
    long countUnreadMessages(@Param("userId") Long userId, @Param("userRoles") List<String> userRoles);

    // Starred messages: Starred by sender or receiver
    @Query("SELECT m FROM EmailMessageEntity m WHERE " +
           "(m.senderId = :userId AND m.isStarredBySender = true AND m.isDeletedBySender = false) OR " +
           "(((m.receiverId = :userId) OR (m.recipientGroup IS NOT NULL AND :userRoles IS NOT NULL AND m.recipientGroup IN :userRoles)) " +
           "AND m.isStarredByReceiver = true AND m.isDeletedByReceiver = false) " +
           "ORDER BY m.createdAt DESC")
    List<EmailMessageEntity> findStarredMessages(@Param("userId") Long userId, @Param("userRoles") List<String> userRoles);

    // Archived messages
    @Query("SELECT m FROM EmailMessageEntity m WHERE " +
           "(m.senderId = :userId AND m.isArchivedBySender = true AND m.isDeletedBySender = false) OR " +
           "(((m.receiverId = :userId) OR (m.recipientGroup IS NOT NULL AND :userRoles IS NOT NULL AND m.recipientGroup IN :userRoles)) " +
           "AND m.isArchivedByReceiver = true AND m.isDeletedByReceiver = false) " +
           "ORDER BY m.createdAt DESC")
    List<EmailMessageEntity> findArchivedMessages(@Param("userId") Long userId, @Param("userRoles") List<String> userRoles);

    // Trashed messages (soft deleted by sender or receiver)
    @Query("SELECT m FROM EmailMessageEntity m WHERE " +
           "(m.senderId = :userId AND m.isDeletedBySender = true) OR " +
           "(((m.receiverId = :userId) OR (m.recipientGroup IS NOT NULL AND :userRoles IS NOT NULL AND m.recipientGroup IN :userRoles)) " +
           "AND m.isDeletedByReceiver = true) " +
           "ORDER BY m.createdAt DESC")
    List<EmailMessageEntity> findTrashedMessages(@Param("userId") Long userId, @Param("userRoles") List<String> userRoles);
}
