package com.taskclock.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;
/**
 * @author 贾浩坤
 * @date 2025/11/4
 */
@Data
@Entity
@SuppressWarnings("all")
@Table(name = "tags")
public class Tag {
    
    /**
     * 任务唯一标识符 使用数据库自增长策略生成主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 标签名 不允许为空
     */
    @Column(name = "tag_name", nullable = false)
    private String tagName;
    
    /**
     * 标签颜色 不允许为空
     */
    @Column(name = "color", nullable = false)
    private String color;
    
    /**
     * icon 标签图标Value
     * availableIcons
     */
    @Column(name = "icon_value")
    private String iconValue;
    
    /**
     * 任务描述
     */
    @Column(name = "description")
    private String description;
    
    /**
     * 创建时间戳 记录任务创建的时间，由Hibernate自动设置 该字段不允许更新
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间戳 记录任务最后更新的时间，由Hibernate自动维护
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
}
