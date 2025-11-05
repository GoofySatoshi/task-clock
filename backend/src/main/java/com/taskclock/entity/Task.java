package com.taskclock.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * Task实体类，用于表示任务信息
 * 该类映射到数据库中的tasks表，包含任务的基本属性、时间戳和标签集合
 */
@Data
@Entity
@SuppressWarnings("all")
@Table(name = "tasks")
public class Task {
    /**
     * 任务唯一标识符
     * 使用数据库自增长策略生成主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 任务标题
     * 不允许为空
     */
    @Column(nullable = false)
    private String title;
    
    /**
     * 预估番茄钟数量
     * 表示完成该任务预计需要的番茄钟时间
     * 不允许为空
     */
    @Column(name = "estimated_pomodoros", nullable = false)
    private Integer estimatedPomodoros;
    
    /**
     * 已完成番茄钟数量
     * 记录该任务已经完成的番茄钟时间
     * 默认值为0
     */
    @Column(name = "completed_pomodoros")
    private Integer completedPomodoros = 0;
    
    /**
     * 任务截止日期
     * 可为空，表示没有截止日期限制
     */
    @Column(name = "due_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date dueDate;
    
    /**
     * 任务标签集合
     * 使用ElementCollection映射集合类型字段
     * 存储在单独的task_tags表中，通过task_id关联
     */
    @ElementCollection
    @CollectionTable(name = "task_tags", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "tag")
    private Set<String> tags = new HashSet<>();
    
    /**
     * 任务完成状态
     * true表示已完成，false表示未完成
     * 默认值为false
     */
    private boolean completed = false;
    
    /**
     * 创建时间戳
     * 记录任务创建的时间，由Hibernate自动设置
     * 该字段不允许更新
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间戳
     * 记录任务最后更新的时间，由Hibernate自动维护
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}