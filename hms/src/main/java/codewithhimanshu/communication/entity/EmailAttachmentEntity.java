package codewithhimanshu.communication.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "email_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailAttachmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email_id", nullable = false)
    private Long emailId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "file_type")
    private String fileType;
}
