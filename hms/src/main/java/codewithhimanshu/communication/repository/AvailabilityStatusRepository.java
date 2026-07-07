package codewithhimanshu.communication.repository;

import codewithhimanshu.communication.entity.AvailabilityStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvailabilityStatusRepository extends JpaRepository<AvailabilityStatusEntity, Long> {
    Optional<AvailabilityStatusEntity> findByUserId(Long userId);
    List<AvailabilityStatusEntity> findByAccountIdAndIsDeletedFalse(Long accountId);
}
