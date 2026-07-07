package codewithhimanshu.communication.entity;

import codewithhimanshu.hospital.entity.HospitalBaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class NotificationEntity extends HospitalBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    /** e.g. "UNREAD", "READ" */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "UNREAD";

    /** APPOINTMENT, EMERGENCY, INVENTORY, DUTY_ASSIGNMENT, MEETING, MEDICINE_REQUEST */
    @Column(name = "notification_type", length = 50)
    private String notificationType;
}
