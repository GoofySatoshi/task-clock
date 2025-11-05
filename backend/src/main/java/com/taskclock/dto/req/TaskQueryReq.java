package com.taskclock.dto.req;

import lombok.Data;

/**
 * @author 贾浩坤
 * @date 2025/11/4
 */
@Data
public class TaskQueryReq {
    /**
     * 任务标题
     */
    private String title;
    
    /**
     * 任务标签
     */
    private String tag;
}
