package codewithhimanshu.communication.repository;

import codewithhimanshu.communication.entity.GroupMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMemberEntity, Long> {
    List<GroupMemberEntity> findByGroupId(Long groupId);
    List<GroupMemberEntity> findByUserId(Long userId);
    void deleteByGroupIdAndUserId(Long groupId, Long userId);
}
