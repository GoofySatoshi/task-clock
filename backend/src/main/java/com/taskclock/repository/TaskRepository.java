package com.taskclock.repository;

import com.taskclock.dto.req.TaskQueryReq;
import com.taskclock.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    
    /**
     * 按标题模糊查询 + 标签精确匹配（标签为null时不筛选）
     * @param req 查询条件DTO
     * @return 符合条件的任务列表
     */
    @Query("SELECT t FROM Task t WHERE " +
            // 若title为null，则不添加title筛选条件；否则模糊匹配
            "(:#{#req.title} IS NULL OR t.title LIKE CONCAT('%', :#{#req.title}, '%')) AND " +
            // 若tag为null，则不添加tag筛选条件；否则筛选包含该tag的任务
            "(:#{#req.tag} IS NULL OR EXISTS (SELECT tag FROM t.tags tag WHERE tag = :#{#req.tag}))")
    Object queryTasks(TaskQueryReq req);
    
    @Modifying // 标记为修改操作（必须，否则JPA会认为是查询）
    @Transactional // 事务支持（更新操作必须，可加在Service层）
    @Query("UPDATE Task t SET " +
            "t.title = CASE WHEN :title IS NOT NULL THEN :title ELSE t.title END, " +
            "t.completed = CASE WHEN :completed IS NOT NULL THEN :completed ELSE t.completed END " +
            "WHERE t.id = :id")
    int updateTitleAndCompletedById(
            @Param("id") Long id,
            @Param("title") String title,
            @Param("completed") Boolean completed
    );
}