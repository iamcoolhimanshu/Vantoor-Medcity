package codewithhimanshu.appointment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import codewithhimanshu.appointment.entity.SlotHold_t;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SlotHoldRepository extends JpaRepository<SlotHold_t, Long> {

	Optional<SlotHold_t> findByHoldToken(String holdToken);

	List<SlotHold_t> findByBookingProfileIdAndSlotDateAndSlotStartAndStatus(Long profileId, LocalDate date,
			LocalTime start, String status);

	@Modifying
	@Transactional

	@Query("UPDATE SlotHold_t h SET h.status = 'EXPIRED' WHERE h.expiresAt < :now AND h.status = 'ACTIVE'")
	int expireStaleHolds(LocalDateTime now);
}