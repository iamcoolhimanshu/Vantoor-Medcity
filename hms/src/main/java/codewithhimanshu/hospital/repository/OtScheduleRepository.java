package codewithhimanshu.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import codewithhimanshu.hospital.entity.OtScheduleEntity;

import java.util.Date;
import java.util.List;

@Repository
public interface OtScheduleRepository extends JpaRepository<OtScheduleEntity, Long> {
	List<OtScheduleEntity> findByAccountIdAndIsDeletedFalse(Long accountId);

	List<OtScheduleEntity> findByHospitalIdAndAccountIdAndIsDeletedFalse(Long hospitalId, Long accountId);

	List<OtScheduleEntity> findByPatientIdAndIsDeletedFalse(Long patientId);

	@Query("SELECT o FROM OtScheduleEntity o WHERE o.otRoom = :room AND o.accountId = :accountId AND o.isDeleted = false "
			+ "AND o.otStatus NOT IN ('CANCELLED','COMPLETED') "
			+ "AND ((o.scheduledStartTime BETWEEN :start AND :end) OR (o.scheduledEndTime BETWEEN :start AND :end))")
	List<OtScheduleEntity> findConflictingSchedules(@Param("room") String room, @Param("accountId") Long accountId,
			@Param("start") Date start, @Param("end") Date end);
}