package com.taskclock.repository;

import com.taskclock.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCompletedOrderByCreatedAtDesc(boolean completed);
    
    @Query("SELECT t FROM Task t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "EXISTS (SELECT tag FROM t.tags tag WHERE LOWER(tag) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Task> searchTasks(String query);
    
    List<Task> findByTagsContaining(String tag);
    
    @Query("SELECT DISTINCT t FROM Task t JOIN t.tags tag WHERE tag IN :tags")
    List<Task> findByTagsIn(List<String> tags);
} 