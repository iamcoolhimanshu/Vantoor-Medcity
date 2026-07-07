package codewithhimanshu.appointment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import codewithhimanshu.appointment.entity.Resource_t;

import java.util.List;

@Repository
public interface Resource_Repository extends JpaRepository<Resource_t, Long> {
	List<Resource_t> findByAccountId(Long accountId);

	List<Resource_t> findByOrgIdAndAccountId(Long orgId, Long accountId);

	List<Resource_t> findByResourceTypeAndAccountId(String resourceType, Long accountId);

	List<Resource_t> findByAccountIdAndIsActiveTrue(Long accountId);
}