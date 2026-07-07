package codewithhimanshu.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dynamic_forms")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DynamicForm extends HospitalBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "form_name", nullable = false)
    private String formName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status; // DRAFT, PUBLISHED, ARCHIVED

    @Column(name = "version")
    @Builder.Default
    private Integer version = 1;

    @Column(name = "role_based_access")
    private String roleBasedAccess; // comma-separated roles, e.g. "ROLE_DOCTOR,ROLE_NURSE" or null/empty for all

    @Column(name = "workflow_integration")
    private String workflowIntegration; // trigger type e.g. "INSURANCE_WORKFLOW"

    @Column(name = "public_access")
    @Builder.Default
    private Boolean publicAccess = false;

    @Column(name = "created_by_username")
    private String createdByUsername;

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<DynamicFormField> fields = new ArrayList<>();

    public void addField(DynamicFormField field) {
        fields.add(field);
        field.setForm(this);
    }

    public void removeField(DynamicFormField field) {
        fields.remove(field);
        field.setForm(null);
    }
}
