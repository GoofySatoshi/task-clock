package com.taskclock.controller;

import com.taskclock.entity.Tag;
import com.taskclock.entity.Task;
import com.taskclock.repository.TagRepository;
import com.taskclock.util.Result;
import io.swagger.v3.oas.annotations.Operation;
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
@io.swagger.v3.oas.annotations.tags.Tag(name = "标签管理", description = "标签元素的CRUD")
public class TagController {
    @Resource
    private TagRepository tagRepository;
    
    /**
     * 获取所有任务列表
     */
    @GetMapping("/list")
    @Operation(summary = "获取所有标签", description = "返回所有标签的列表")
    public Result<List<Task>> getNotCompletedTasks() {
        return Result.success(tagRepository.findAll());
    }
    
    /**
     * 创建任务
     */
    @PostMapping("/insert")
    @Operation(summary = "创建新标签", description = "添加一个新的标签")
    public Result createTask(@RequestBody Tag task) {
        tagRepository.save(task);
        return Result.success("添加任务成功");
    }
    
    /**
     * 删除任务
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除标签", description = "根据ID删除指定标签")
    public Result deleteTask(@PathVariable("id") Long id) {
        tagRepository.deleteById(id);
        return Result.success("删除任务成功");
    }
    
    /**
     * 更新任务
     */
    @PutMapping("/update")
    @Operation(summary = "更新标签", description = "更新现有标签的信息")
    public Result updateTask(@RequestBody Tag task){
        tagRepository.save(task);
        return Result.success("更新任务成功");
    }
}
