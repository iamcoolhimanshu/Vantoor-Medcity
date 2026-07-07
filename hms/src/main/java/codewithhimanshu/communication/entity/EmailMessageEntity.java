package codewithhimanshu.communication.entity;

import codewithhimanshu.hospital.entity.HospitalBaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "email_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class EmailMessageEntity extends HospitalBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "receiver_id")
    private Long receiverId; // Can be null for broadcasts, drafts, or group messages

    @Column(nullable = false)
    private String subject;

    @Lob
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String message;

    /** e.g. "SENT", "DRAFT" */
    @Column(nullable = false)
    private String status;

    @Column(name = "is_starred_by_sender")
    @Builder.Default
    private Boolean isStarredBySender = false;

    @Column(name = "is_starred_by_receiver")
    @Builder.Default
    private Boolean isStarredByReceiver = false;

    @Column(name = "is_deleted_by_sender")
    @Builder.Default
    private Boolean isDeletedBySender = false;

    @Column(name = "is_deleted_by_receiver")
    @Builder.Default
    private Boolean isDeletedByReceiver = false;

    @Column(name = "is_archived_by_sender")
    @Builder.Default
    private Boolean isArchivedBySender = false;

    @Column(name = "is_archived_by_receiver")
    @Builder.Default
    private Boolean isArchivedByReceiver = false;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    /** LOW, MEDIUM, HIGH, CRITICAL */
    @Column(length = 20)
    @Builder.Default
    private String priority = "LOW";

    /** e.g. APPOINTMENT, INVENTORY, INQUIRY, ADMINISTRATIVE */
    @Column(length = 50)
    private String category;

    @Column(name = "recipient_group", length = 100)
    private String recipientGroup; // e.g. "DOCTORS", "NURSES", "ALL_STAFF"
}
