package codewithhimanshu.appointment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import codewithhimanshu.appointment.entity.Appointment_t;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface Appointment_Repository extends JpaRepository<Appointment_t, Long> {

	Optional<Appointment_t> findByAppointmentNumber(String appointmentNumber);

	List<Appointment_t> findByAccountIdOrderByAppointmentDateDescStartTimeDesc(Long accountId);

	List<Appointment_t> findByOrgIdAndAccountId(Long orgId, Long accountId);

	List<Appointment_t> findByCustomerIdAndAccountId(Long customerId, Long accountId);

	List<Appointment_t> findByResourceIdAndAppointmentDateAndAccountId(Long resourceId, LocalDate date, Long accountId);

	List<Appointment_t> findByAppointmentDateAndAccountId(LocalDate date, Long accountId);

	List<Appointment_t> findByStatusAndAccountId(String status, Long accountId);

	List<Appointment_t> findByBookingProfileIdAndAppointmentDateAndStatusNotIn(Long bookingProfileId, LocalDate date,
			List<String> excludedStatuses);

	List<Appointment_t> findByBookingProfileIdAndAppointmentDate(Long bookingProfileId, LocalDate date);

	@Query("SELECT COUNT(a) FROM Appointment_t a WHERE a.bookingProfileId = :profileId "
			+ "AND a.appointmentDate = :date AND a.startTime = :startTime " + "AND a.status NOT IN ('CANCELLED')")
	long countActiveBookingsForSlot(@Param("profileId") Long profileId, @Param("date") LocalDate date,
			@Param("startTime") LocalTime startTime);

	@Query("SELECT COUNT(a) FROM Appointment_t a WHERE a.bookingProfileId = :profileId "
			+ "AND a.appointmentDate = :date AND a.status NOT IN ('CANCELLED')")
	long countActiveBookingsForDay(@Param("profileId") Long profileId, @Param("date") LocalDate date);

	List<Appointment_t> findByBookingProfileIdAndAccountId(Long bookingProfileId, Long accountId);

	List<Appointment_t> findByBookingProfileIdInAndAccountId(List<Long> bookingProfileIds, Long accountId);
}