package codewithhimanshu.hospital.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dynamic_form_fields")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "form")
@EqualsAndHashCode(exclude = "form")
public class DynamicFormField {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    @JsonIgnore
    private DynamicForm form;

    @Column(name = "field_name", nullable = false)
    private String fieldName;

    @Column(name = "field_label", nullable = false)
    private String fieldLabel;

    @Column(name = "field_type", nullable = false)
    private String fieldType; // TEXT, TEXTAREA, NUMBER, EMAIL, PHONE, DATE, TIME, etc.

    @Column(nullable = false)
    private boolean required;

    @Column(name = "validation_json", columnDefinition = "TEXT")
    private String validationJson; // min, max, minLength, maxLength, regex, helpText, etc.

    @Column(name = "options_json", columnDefinition = "TEXT")
    private String optionsJson; // Dropdown values, checkbox/radio options as JSON array

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "conditional_json", columnDefinition = "TEXT")
    private String conditionalJson; // IF targetField = expectedValue SHOW
}
