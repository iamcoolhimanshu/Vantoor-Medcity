package codewithhimanshu.appointment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import codewithhimanshu.appointment.entity.BookingDateOverride_t;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingDateOverrideRepository extends JpaRepository<BookingDateOverride_t, Long> {
	List<BookingDateOverride_t> findByBookingProfileId(Long bookingProfileId);

	Optional<BookingDateOverride_t> findByBookingProfileIdAndOverrideDate(Long bookingProfileId, LocalDate date);

	void deleteByBookingProfileId(Long bookingProfileId);
}
