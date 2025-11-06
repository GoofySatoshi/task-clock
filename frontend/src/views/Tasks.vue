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
import { useRouter } from 'vue-router'
import { Timer, Edit, Delete } from '@element-plus/icons-vue'
import { taskApi } from '../api/task.js'
const router = useRouter()

// 补充：修正 taskList 为响应式变量
const taskList = ref([])
const searchQuery = ref('')
const selectedTags = ref([])
const showModal = ref(false)
const taskFormRef = ref(null)
const loading = ref(false)
const error = ref(null)

// 补充：编辑任务对象（初始化默认值）
const editingTask = ref({
  id: '', // 编辑时赋值，新增时为空
  title: '',
  estimatedPomodoros: 1, // 默认1个番茄钟
  completedPomodoros: 0, // 初始完成0个
  tags: [],
  dueDate: '',
  completed: false // 初始未完成
})

// 补充：可用标签列表（可根据实际需求扩展）
const availableTags = ref([
  '学习', '工作', '生活', '紧急', '重要', '长期', '短期'
])

// 初始化任务列表
async function init() {
  loading.value = true
  try {
    const response = await taskApi.getAllTasks().then( response => response.data)
    taskList.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('获取任务列表失败:', err)
    error.value = '获取任务失败，请稍后重试'
    taskList.value = [] // 确保始终是数组
  } finally {
    loading.value = false
  }
}

const filteredTasks = computed(() => {
  // 如果两个筛选条件都为空，直接返回所有任务
  if (!searchQuery.value && selectedTags.value.length === 0) {
    return taskList.value
  }

  return taskList.value.filter(task => {
    // 处理标题匹配 - 如果搜索关键词为空，则认为匹配
    const titleMatch = !searchQuery.value ||
        task.title?.toLowerCase().includes(searchQuery.value.toLowerCase())

    // 处理标签匹配 - 如果未选择标签，则认为匹配
    const tagMatch = selectedTags.value.length === 0 ||
        selectedTags.value.every(tag => task.tags?.includes(tag))

    return titleMatch && tagMatch
  })
})

// 补充：打开添加任务弹窗
function openAddTaskDialog() {
  // 重置编辑任务对象
  editingTask.value = {
    id: '',
    title: '',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    tags: [],
    dueDate: '',
    completed: false
  }
  showModal.value = true
}

// 补充：处理任务完成状态切换
async function handleToggleTask(task) {
  loading.value = true
  try {
    await taskApi.updateTask({ ...task, completed: task.completed })
    console.log('任务状态更新成功')
  } catch (err) {
    console.error('更新任务状态失败:', err)
    error.value = '更新任务状态失败，请稍后重试'
    // 失败时回滚状态
    task.completed = !task.completed
  } finally {
    loading.value = false
  }
}

// 补充：开始学习（跳转至番茄钟页面，可根据路由配置调整）
function handleStartLearning(task) {
  // 假设路由为 /pomodoro，携带任务ID参数
  router.push({ path: '/pomodoro', query: { taskId: task.id } })
}

// 补充：打开编辑任务弹窗
function handleEditTask(task) {
  // 深拷贝任务对象，避免直接修改原数据
  editingTask.value = JSON.parse(JSON.stringify(task))
  showModal.value = true
}

// 补充：删除任务
async function handleDeleteTask(taskId) {
  loading.value = true
  try {
    await taskApi.deleteTask(taskId)
    // 从列表中移除删除的任务
    taskList.value = taskList.value.filter(task => task.id !== taskId)
    console.log('任务删除成功')
  } catch (err) {
    console.error('删除任务失败:', err)
    error.value = '删除任务失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 补充：关闭弹窗
function handleDialogClose() {
  showModal.value = false
  // 重置表单校验
  if (taskFormRef.value) {
    taskFormRef.value.resetFields()
  }
}

// 补充：添加任务
async function handleAddTask() {
  // 表单校验
  if (!taskFormRef.value) return
  try {
    await taskFormRef.value.validate()
    loading.value = true
    // 调用API创建任务
    const response = await taskApi.createTask(editingTask.value)
    // 新增任务添加到列表
    taskList.value.push({
      id: response.data.id || Date.now(), // 用时间戳临时生成ID（实际以接口返回为准）
      ...editingTask.value
    })
    console.log('任务添加成功')
    showModal.value = false
  } catch (err) {
    console.error('添加任务失败:', err)
    error.value = '添加任务失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 补充：更新任务
async function handleUpdateTask() {
  // 表单校验
  if (!taskFormRef.value) return
  try {
    await taskFormRef.value.validate()
    loading.value = true
    // 调用API更新任务
    await taskApi.updateTask(editingTask.value)
    // 更新列表中的任务数据
    const index = taskList.value.findIndex(task => task.id === editingTask.value.id)
    if (index !== -1) {
      taskList.value[index] = { ...editingTask.value }
    }
    console.log('任务更新成功')
    showModal.value = false
  } catch (err) {
    console.error('更新任务失败:', err)
    error.value = '更新任务失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 补充：标签颜色映射（随机生成或固定映射）
function getTagColor(tag) {
  // 为不同标签分配固定颜色（可扩展）
  const colorMap = {
    学习: 'blue',
    工作: 'green',
    生活: 'orange',
    紧急: 'red',
    重要: 'purple',
    长期: 'cyan',
    短期: 'pink'
  }
  // 未定义的标签使用随机颜色
  return colorMap[tag] || ['success', 'info', 'warning', 'primary'][Math.floor(Math.random() * 4)]
}

// 补充：禁止选择过去的日期
function disablePastDates(time) {
  // 返回 true 表示禁用该日期
  return time.getTime() < Date.now() - 8.64e7 // 8.64e7 = 24*60*60*1000，禁用今天之前的日期
}

// 组件挂载时获取任务列表
onMounted(() => {
  init()
})
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