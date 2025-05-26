<template>
  <div class="tasks-container">
    <div class="tasks-header">
      <h1>任务管理</h1>
      <el-button type="primary" @click="openAddTaskDialog">
        添加任务
      </el-button>
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      closable
      @close="error = null"
    />

    <!-- 搜索和过滤 -->
    <div class="tasks-filters">
      <el-input
        v-model="searchQuery"
        placeholder="搜索任务..."
        prefix-icon="Search"
        clearable
      />
      <el-select
        v-model="selectedTags"
        multiple
        collapse-tags
        placeholder="选择标签"
        clearable
      >
        <el-option
          v-for="tag in availableTags"
          :key="tag"
          :label="tag"
          :value="tag"
        />
      </el-select>
    </div>

    <!-- 任务列表 -->
    <el-skeleton :loading="loading" animated :count="3" v-if="loading">
      <template #template>
        <div class="task-card skeleton">
          <div class="task-header">
            <div class="task-title"></div>
            <div class="task-actions"></div>
          </div>
          <div class="task-content"></div>
        </div>
      </template>
    </el-skeleton>

    <div v-else class="tasks-list">
      <el-empty v-if="filteredTasks.length === 0" description="暂无任务" />
      
      <div v-else v-for="task in filteredTasks" :key="task.id" class="task-card">
        <div class="task-header">
          <div class="task-title">
            <el-checkbox
              v-model="task.completed"
              @change="() => handleToggleTask(task)"
              class="custom-checkbox"
            >
              <span class="custom-checkbox-label" :class="{ completed: task.completed }">{{ task.title }}</span>
            </el-checkbox>
          </div>
          <div class="task-actions">
            <el-button-group>
              <el-button
                type="primary"
                :icon="Timer"
                circle
                @click="handleStartLearning(task)"
                :disabled="task.completed"
                :title="task.completed ? '任务已完成' : '开始学习'"
              />
              <el-button
                type="primary"
                :icon="Edit"
                circle
                @click="handleEditTask(task)"
              />
              <el-button
                type="danger"
                :icon="Delete"
                circle
                @click="handleDeleteTask(task.id)"
              />
            </el-button-group>
          </div>
        </div>
        
        <div class="task-content">
          <div class="task-tags">
            <el-tag
              v-for="tag in task.tags"
              :key="tag"
              size="small"
              :color="getTagColor(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
          
          <div class="task-progress">
            <span>番茄钟进度：</span>
            <el-progress
              :percentage="(task.completedPomodoros / task.estimatedPomodoros) * 100"
              :format="format => `${task.completedPomodoros}/${task.estimatedPomodoros}`"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑任务模态框 -->
    <el-dialog
      v-model="showModal"
      :title="editingTask.id ? '编辑任务' : '添加任务'"
      width="500px"
      :close-on-click-modal="false"
      :show-close="true"
      @close="handleDialogClose"
      destroy-on-close
    >
      <el-form
        ref="taskFormRef"
        :model="editingTask"
        label-width="100px"
        @submit.prevent
      >
        <el-form-item label="任务标题" required>
          <el-input v-model="editingTask.title" />
        </el-form-item>
        
        <el-form-item label="预计番茄数" required>
          <el-input-number
            v-model="editingTask.estimatedPomodoros"
            :min="1"
            :max="20"
          />
        </el-form-item>

        <el-form-item label="截止日期">
          <el-date-picker
            v-model="editingTask.dueDate"
            type="date"
            placeholder="选择截止日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disablePastDates"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="标签">
          <el-select
            v-model="editingTask.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或创建标签"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button
            type="primary"
            @click="editingTask.id ? handleUpdateTask() : handleAddTask()"
          >
            {{ editingTask.id ? '更新' : '添加' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../store/task'
import { useRouter } from 'vue-router'
import { taskApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Timer, Edit, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const taskStore = useTaskStore()
const searchQuery = ref('')
const selectedTags = ref([])
const showModal = ref(false)
const taskFormRef = ref(null)
const loading = ref(false)
const error = ref(null)

// 标签颜色映射
const tagColors = {
  '工作': '#4CAF50',
  '文档': '#2196F3',
  '重要': '#F44336',
  '学习': '#FF9800',
  'Vue': '#42B983',
  '前端': '#1E88E5',
  '阅读': '#795548',
  '计算机': '#607D8B',
  '开发': '#9C27B0',
  '优化': '#FF5722',
  'DevOps': '#00BCD4',
  '修复': '#E91E63'
}

// 获取标签颜色
const getTagColor = (tag) => {
  return tagColors[tag] || '#909399'
}

// 获取所有任务
const fetchTasks = async () => {
  try {
    loading.value = true
    error.value = null
    await taskStore.fetchTasks()
  } catch (err) {
    error.value = err.message || '获取任务列表失败'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 初始化编辑任务表单
const initTaskForm = () => ({
  title: '',
  estimatedPomodoros: 1,
  dueDate: '',
  tags: [],
  completed: false,
  completedPomodoros: 0
})

// 使用 ref 来管理编辑任务状态
const editingTask = ref(initTaskForm())

// 禁用过去的日期
const disablePastDates = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 打开添加任务对话框
const openAddTaskDialog = () => {
  editingTask.value = initTaskForm()
  showModal.value = true
}

// 处理对话框关闭
const handleDialogClose = () => {
  showModal.value = false
  editingTask.value = initTaskForm()
  if (taskFormRef.value) {
    taskFormRef.value.resetFields()
  }
}

// 编辑任务
const handleEditTask = (task) => {
  editingTask.value = {
    ...task,
    dueDate: task.dueDate || '',
    tags: task.tags || []
  }
  showModal.value = true
}

// 添加任务
const handleAddTask = async () => {
  if (!editingTask.value.title || !editingTask.value.estimatedPomodoros) {
    ElMessage.warning('请填写必填项')
    return
  }

  try {
    loading.value = true
    const newTask = {
      ...editingTask.value,
      completed: false,
      completedPomodoros: 0,
      dueDate: editingTask.value.dueDate || null,
      tags: editingTask.value.tags || []
    }
    await taskStore.addTask(newTask)
    handleDialogClose()
    ElMessage.success('任务添加成功')
    await fetchTasks() // 重新获取任务列表
  } catch (error) {
    ElMessage.error('添加任务失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 更新任务
const handleUpdateTask = async () => {
  if (!editingTask.value.title || !editingTask.value.estimatedPomodoros) {
    ElMessage.warning('请填写必填项')
    return
  }

  try {
    loading.value = true
    const { id, ...updates } = editingTask.value
    await taskStore.updateTask(id, {
      ...updates,
      dueDate: editingTask.value.dueDate || null,
      tags: editingTask.value.tags || []
    })
    handleDialogClose()
    ElMessage.success('任务更新成功')
    await fetchTasks() // 重新获取任务列表
  } catch (error) {
    ElMessage.error('更新任务失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 删除任务
const handleDeleteTask = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '提示', {
      type: 'warning'
    })
    loading.value = true
    await taskStore.deleteTask(id)
    ElMessage.success('任务删除成功')
    await fetchTasks() // 重新获取任务列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除任务失败：' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 切换任务完成状态
const handleToggleTask = async (task) => {
  try {
    loading.value = true
    await taskStore.updateTask(task.id, {
      completed: !task.completed
    })
    ElMessage.success(task.completed ? '任务已标记为未完成' : '任务已完成')
    await fetchTasks() // 重新获取任务列表
  } catch (error) {
    ElMessage.error('更新任务状态失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 开始学习（启动番茄钟）
const handleStartLearning = (task) => {
  if (task.completed) {
    ElMessage.warning('任务已完成，无法开始学习')
    return
  }
  
  // 将当前任务设置为活动任务
  taskStore.setCurrentTask(task)
  
  // 跳转到番茄钟页面
  router.push('/timer')
}

// 计算属性：过滤后的任务列表
const filteredTasks = computed(() => {
  if (!taskStore.tasks) return []
  
  let tasks = taskStore.tasks

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter(task => 
      task.title.toLowerCase().includes(query) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }

  // 标签过滤
  if (selectedTags.value.length > 0) {
    tasks = tasks.filter(task =>
      task.tags && selectedTags.value.every(tag => task.tags.includes(tag))
    )
  }

  return tasks
})

// 计算属性：所有可用标签
const availableTags = computed(() => {
  if (!taskStore.tasks) return []
  
  const tags = new Set()
  taskStore.tasks.forEach(task => {
    if (task.tags) {
      task.tags.forEach(tag => tags.add(tag))
    }
  })
  return Array.from(tags)
})

// 组件挂载时获取任务列表
onMounted(fetchTasks)
</script>

<style scoped>
.tasks-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tasks-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

/* 添加任务按钮样式 */
.tasks-header .el-button--primary {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: white;
}

.tasks-header .el-button--primary:hover {
  background-color: var(--el-color-primary-light-3);
  border-color: var(--el-color-primary-light-3);
}

:deep(.dark-mode) .tasks-header .el-button--primary {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: white;
}

:deep(.dark-mode) .tasks-header .el-button--primary:hover {
  background-color: var(--el-color-primary-light-3);
  border-color: var(--el-color-primary-light-3);
}

.tasks-filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.tasks-list {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.task-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 500;
}

.task-title .completed {
  text-decoration: line-through;
  color: #909399;
}

.task-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.task-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-progress span {
  display: block;
  margin-bottom: 4px;
  color: #909399;
  font-size: 14px;
}

.skeleton {
  height: 150px;
  background: #f5f7fa;
  border-radius: 8px;
}

.skeleton .task-header {
  height: 24px;
  background: #e4e7ed;
  border-radius: 4px;
  margin-bottom: 15px;
}

.skeleton .task-content {
  height: 80px;
  background: #e4e7ed;
  border-radius: 4px;
}

.task-actions .el-button {
  margin-left: 8px;
}

.task-actions .el-button.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 恢复按钮颜色样式 */
.task-actions .el-button-group {
  display: flex;
  gap: 8px;
}

.task-actions .el-button-group .el-button {
  margin-left: 0;
}

.task-actions .el-button-group .el-button--primary {
  background-color: #409EFF;
  border-color: #409EFF;
  color: white;
}

.task-actions .el-button-group .el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.task-actions .el-button-group .el-button--danger {
  background-color: #F56C6C;
  border-color: #F56C6C;
  color: white;
}

.task-actions .el-button-group .el-button--danger:hover {
  background-color: #f78989;
  border-color: #f78989;
}

.task-actions .el-button-group .el-button.is-disabled {
  background-color: #a0cfff;
  border-color: #a0cfff;
  color: white;
  opacity: 0.5;
}

.custom-checkbox {
  width: 100%;
}

.custom-checkbox-label {
  font-size: 16px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .tasks-filters {
    flex-direction: column;
  }
  
  .tasks-list {
    grid-template-columns: 1fr;
  }
}
</style> 