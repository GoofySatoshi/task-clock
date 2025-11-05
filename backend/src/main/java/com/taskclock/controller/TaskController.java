package com.taskclock.controller;

import com.taskclock.dto.req.TaskQueryReq;
import com.taskclock.entity.Task;
import com.taskclock.repository.TagRepository;
import com.taskclock.repository.TaskRepository;
import com.taskclock.util.Result;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/task")
@SuppressWarnings("all")
public class TaskController {
    @Resource
    private TaskRepository taskRepository;
    @Resource
    private TagRepository tagRepository;
    @GetMapping("/ping")
    public Map<String, Object> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "pong");
        response.put("timestamp", LocalDateTime.now());
        response.put("version", "1.0.0");
        return response;
    }
    
    /**
     * 获取所有任务列表
     */
    @GetMapping("/list")
    public Result<List<Task>> getNotCompletedTasks() {
        return Result.success(taskRepository.findAll());
    }
    
    /**
     * 获取指定查询参数的任务列表
     */
    @PostMapping("/query")
    public Result<List<Task>> getTasksByQuery(@RequestBody TaskQueryReq req) {
        return Result.success(taskRepository.queryTasks(req));
    }
    
    
    /**
     * 创建任务
     */
    @PostMapping("/insert")
    public Result createTask(@RequestBody Task task) {
        taskRepository.save(task);
        return Result.success("添加任务成功");
    }
    
    /**
     * 删除任务
     */
    @DeleteMapping("/delete/{id}")
    public Result deleteTask(@PathVariable("id") Long id) {
        taskRepository.deleteById(id);
        return Result.success("删除任务成功");
    }
    
    /**
     * 更新任务
     */
    @PutMapping("/update")
    public Result updateTask(@RequestBody Task task){
        taskRepository.save(task);
        return Result.success("更新任务成功");
    }
} 