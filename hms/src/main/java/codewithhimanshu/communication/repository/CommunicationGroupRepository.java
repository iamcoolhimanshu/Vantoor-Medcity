package codewithhimanshu.communication.repository;

import codewithhimanshu.communication.entity.CommunicationGroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunicationGroupRepository extends JpaRepository<CommunicationGroupEntity, Long> {
    List<CommunicationGroupEntity> findByAccountIdAndIsDeletedFalse(Long accountId);
}
