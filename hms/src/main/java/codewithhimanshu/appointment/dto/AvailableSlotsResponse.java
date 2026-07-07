package codewithhimanshu.appointment.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class AvailableSlotsResponse {
	private Long bookingProfileId;
	private String profileName;
	private LocalDate date;
	private String timezone;
	private List<SlotDto> slots;

	@Data
	public static class SlotDto {
		private String startTime;
		private String endTime;
		private boolean available;
		private int remainingCapacity;
	}
}
