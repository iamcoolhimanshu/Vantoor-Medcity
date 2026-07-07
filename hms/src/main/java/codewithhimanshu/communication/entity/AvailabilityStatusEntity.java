package codewithhimanshu.communication.entity;

import codewithhimanshu.hospital.entity.HospitalBaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "availability_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class AvailabilityStatusEntity extends HospitalBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    /** AVAILABLE, BUSY, ON_LEAVE, EMERGENCY_DUTY, OFFLINE */
    @Column(nullable = false, length = 30)
    private String status;
}
