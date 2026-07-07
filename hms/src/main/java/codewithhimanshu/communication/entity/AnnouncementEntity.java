package codewithhimanshu.communication.entity;

import codewithhimanshu.hospital.entity.HospitalBaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class AnnouncementEntity extends HospitalBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "target_department")
    private String targetDepartment; // e.g. "Cardiology", "Pharmacy", or null for all
}
