package codewithhimanshu.appointment.dto;

import lombok.Data;

@Data
public class PublicBookingRequest {
	private String holdToken;
	private String customerName;
	private String customerEmail;
	private String customerPhone;
	private String visitorMessage;
	private String timezone;
}
