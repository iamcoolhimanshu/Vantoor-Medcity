package codewithhimanshu.hospital.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dynamic_form_submissions")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DynamicFormSubmission extends HospitalBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private DynamicForm form;

    @Column(name = "submitted_by")
    private String submittedBy; // Username or "anonymous"

    @Column(name = "submission_json", columnDefinition = "LONGTEXT")
    private String submissionJson; // JSON key-value store of filled values
}
