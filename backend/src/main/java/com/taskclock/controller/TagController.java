package com.taskclock.controller;

import com.taskclock.entity.Tag;
import com.taskclock.entity.Task;
import com.taskclock.repository.TagRepository;
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
import java.util.List;

/**
 * @author 贾浩坤
 * @date 2025/11/5
 */
@RestController
@RequestMapping("/tag")
@SuppressWarnings("all")
public class TagController {
    @Resource
    private TagRepository tagRepository;
    
    /**
     * 获取所有任务列表
     */
    @GetMapping("/list")
    public Result<List<Task>> getNotCompletedTasks() {
        return Result.success(tagRepository.findAll());
    }
    
    /**
     * 创建任务
     */
    @PostMapping("/insert")
    public Result createTask(@RequestBody Tag task) {
        tagRepository.save(task);
        return Result.success("添加任务成功");
    }
    
    /**
     * 删除任务
     */
    @DeleteMapping("/delete/{id}")
    public Result deleteTask(@PathVariable("id") Long id) {
        tagRepository.deleteById(id);
        return Result.success("删除任务成功");
    }
    
    /**
     * 更新任务
     */
    @PutMapping("/update")
    public Result updateTask(@RequestBody Tag task){
        tagRepository.save(task);
        return Result.success("更新任务成功");
    }
}
