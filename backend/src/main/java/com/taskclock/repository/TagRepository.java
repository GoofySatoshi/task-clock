package com.taskclock.repository;

import com.taskclock.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author 贾浩坤
 * @date 2025/11/4
 */
public interface TagRepository extends JpaRepository<Tag, Long> {

}
