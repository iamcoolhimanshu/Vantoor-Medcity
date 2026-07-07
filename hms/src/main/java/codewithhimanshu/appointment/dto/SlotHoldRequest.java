package codewithhimanshu.appointment.dto;

import lombok.Data;

@Data
public class SlotHoldRequest {
	private Long bookingProfileId;
	private String slotDate;
	private String slotStart;
	private String visitorSession;
}
