package codewithhimanshu.appointment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import codewithhimanshu.appointment.entity.BookingWorkingHours_t;

import java.util.List;

@Repository
public interface BookingWorkingHoursRepository extends JpaRepository<BookingWorkingHours_t, Long> {

	List<BookingWorkingHours_t> findByBookingProfileIdOrderByDayOfWeek(Long bookingProfileId);

	@Modifying
	@Transactional
	void deleteByBookingProfileId(Long bookingProfileId);
}