package codewithhimanshu.appointment.dto;

import lombok.Data;

@Data
public class RescheduleRequest {
	private String newDate;
	private String newStart;
	private String reason;
}
