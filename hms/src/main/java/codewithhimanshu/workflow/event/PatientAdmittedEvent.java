package codewithhimanshu.workflow.event;

import java.util.Map;

public class PatientAdmittedEvent extends HospitalDomainEvent {
    public PatientAdmittedEvent(Object source, String admissionId, Map<String, Object> payload) {
        super(source, "PATIENT_ADMITTED", admissionId, "ADMISSION", payload);
    }
}
