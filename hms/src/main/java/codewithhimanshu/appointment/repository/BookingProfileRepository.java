package codewithhimanshu.appointment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import codewithhimanshu.appointment.entity.BookingProfile_t;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingProfileRepository extends JpaRepository<BookingProfile_t, Long> {
	Optional<BookingProfile_t> findBySlug(String slug);

	List<BookingProfile_t> findByAccountIdAndIsActiveTrue(Long accountId);

	List<BookingProfile_t> findByAccountId(Long accountId);

	boolean existsBySlug(String slug);
}
