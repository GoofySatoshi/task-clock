<template>
  <div class="timer-page">
    <div class="timer-wrapper">
      <!-- 任务详情悬浮栏 -->
      <div class="task-info-float" v-if="currentTask">
        <div class="task-info-header">
          <el-icon><List /></el-icon>
          <span>当前任务</span>
          <el-button
            type="primary"
            link
            class="edit-task-btn"
            @click="openEditDialog"
          >
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
        </div>
        <div class="task-info-content">
          <div class="task-info-main">
            <div class="task-info-title">
              <el-checkbox
                :model-value="currentTask.completed"
                @change="(val) => toggleTaskComplete(currentTask, val)"
              />
              <span class="task-title" :class="{ 'task-completed': currentTask.completed }">
                {{ currentTask.title }}
              </span>
            </div>
            <div class="task-info-tags">
              <el-tag size="small" :type="currentTask.priority === 'high' ? 'danger' : currentTask.priority === 'medium' ? 'warning' : 'info'">
                {{ currentTask.priority === 'high' ? '高' : currentTask.priority === 'medium' ? '中' : '低' }}优先级
              </el-tag>
              <el-tag size="small" type="success" v-if="currentTask.estimatedPomodoros">
                预计 {{ currentTask.estimatedPomodoros }} 番茄
              </el-tag>
              <el-tag size="small" type="success" v-if="currentTask.completedPomodoros">
                已完成 {{ currentTask.completedPomodoros }} 番茄
              </el-tag>
            </div>
          </div>
          <div class="task-info-meta">
            <div class="task-meta-item" v-if="currentTask.dueDate">
              <el-icon><Calendar /></el-icon>
              <span class="due-date" :class="{ 'due-date-overdue': isOverdue(currentTask.dueDate) }">
                截止日期：{{ formatDueDate(currentTask.dueDate) }}
              </span>
            </div>
            <div class="task-meta-item" v-if="currentTask.description">
              <el-icon><Document /></el-icon>
              <span class="task-description">{{ currentTask.description }}</span>
            </div>
            <div class="task-meta-item" v-if="currentTask.category">
              <el-icon><Collection /></el-icon>
              <span class="task-category">{{ currentTask.category }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="timer-container">
        <div class="timer-mode">
          <el-button 
            v-for="mode in timerModes" 
            :key="mode.value"
            :type="currentMode === mode.value ? 'primary' : 'default'"
            :class="[
              { 'is-disabled': isRunning && currentMode !== mode.value }
            ]"
            @click="setMode(mode.value)"
            :disabled="isRunning && currentMode !== mode.value"
          >
            <el-icon>
              <component :is="mode.icon" />
            </el-icon>
            {{ mode.label }}
          </el-button>
          <el-button
            type="default"
            class="task-btn"
            @click="$router.push('/tasks')"
          >
            <el-icon><List /></el-icon>
            {{ currentTask ? '切换任务' : '选择任务' }}
          </el-button>
          <button
            v-if="currentMode !== 'work' && !isRunning"
            class="skip-break-btn"
            @click="skipBreak"
          >
            <el-icon><ArrowRight /></el-icon>
            跳过休息
          </button>
        </div>

        <div class="timer-display">
          <div class="time">{{ formatTime(timeLeft) }}</div>
          <div class="progress-ring">
            <svg width="300" height="300" viewBox="0 0 300 300">
              <circle
                class="progress-ring-circle-bg"
                stroke-width="8"
                stroke="var(--border-color)"
                fill="transparent"
                r="140"
                cx="150"
                cy="150"
              />
              <circle
                class="progress-ring-circle"
                stroke-width="8"
                stroke="var(--primary-color)"
                fill="transparent"
                r="140"
                cx="150"
                cy="150"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="dashOffset"
              />
            </svg>
          </div>
        </div>

        <div class="timer-controls">
          <el-button 
            type="primary" 
            size="large"
            class="control-btn"
            @click="toggleTimer"
          >
            <el-icon>
              <component :is="isRunning ? VideoPause : VideoPlay" />
            </el-icon>
            {{ isRunning ? '暂停' : '开始' }}
          </el-button>
          <el-button 
            type="info" 
            size="large"
            class="control-btn"
            @click="resetTimer"
          >
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </div>

        <!-- 记分牌 -->
        <div class="timer-scoreboard">
          <div class="scoreboard-item">
            <el-icon><Timer /></el-icon>
            <div class="scoreboard-label">已完成番茄数</div>
            <div class="scoreboard-value">{{ completedPomodoros }}</div>
          </div>
          <div class="scoreboard-divider"></div>
          <div class="scoreboard-item" v-if="currentMode === 'work'">
            <el-icon><Coffee /></el-icon>
            <div class="scoreboard-label">距离休息还有</div>
            <div class="scoreboard-value">{{ formatTime(timeLeft) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改编辑任务对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑任务"
      width="400px"
      :close-on-click-modal="false"
      :show-close="true"
      @close="handleDialogClose"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="editForm.dueDate"
            type="date"
            placeholder="选择截止日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disablePastDates"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleEditTask">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTaskStore } from '../store/task'
import { useSettingsStore } from '../store/settings'
import { ElMessage } from 'element-plus'
import { 
  Timer, 
  Coffee, 
  Moon, 
  VideoPlay, 
  VideoPause, 
  RefreshRight, 
  List, 
  Edit, 
  Calendar, 
  Document, 
  Collection,
  ArrowRight
} from '@element-plus/icons-vue'

const taskStore = useTaskStore()
const settingsStore = useSettingsStore()

// 使用本地变量存储设置值
const localSettings = ref({
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationEnabled: true
})

// 监听设置变化
watch(() => settingsStore.settings, (newSettings) => {
  if (newSettings) {
    // 只更新非主题相关的设置
    const { themeColor, darkMode, ...nonThemeSettings } = newSettings
    localSettings.value = nonThemeSettings
  }
}, { immediate: true })

// 定义计时器模式
const timerModes = [
  { 
    label: '专注', 
    value: 'work', 
    icon: Timer,
    duration: computed(() => localSettings.value.workDuration * 60) 
  },
  { 
    label: '短休息', 
    value: 'shortBreak', 
    icon: Coffee,
    duration: computed(() => localSettings.value.shortBreakDuration * 60) 
  },
  { 
    label: '长休息', 
    value: 'longBreak', 
    icon: Moon,
    duration: computed(() => localSettings.value.longBreakDuration * 60) 
  }
]

// 计时器状态
const currentMode = ref('work')
const timeLeft = ref(0)
const isRunning = ref(false)
const completedPomodoros = ref(0)
const timerInterval = ref(null)
const showEditDialog = ref(false)
const editForm = ref({
  dueDate: ''
})

// 计算属性：当前模式的持续时间
const currentModeDuration = computed(() => {
  const mode = timerModes.find(m => m.value === currentMode.value)
  return mode ? mode.duration.value : 0
})

// 计算属性：当前任务
const currentTask = computed(() => taskStore.currentTask)

// 计算属性：进度环
const circumference = computed(() => 2 * Math.PI * 140)
const dashOffset = computed(() => {
  const progress = timeLeft.value / currentModeDuration.value
  return circumference.value * (1 - progress)
})

// 监听当前模式的变化，更新剩余时间
watch(currentMode, (newMode) => {
  if (!isRunning.value) {
    timeLeft.value = currentModeDuration.value
  }
}, { immediate: true })

// 监听设置变化，更新剩余时间
watch(() => localSettings.value, () => {
  if (!isRunning.value) {
    timeLeft.value = currentModeDuration.value
  }
}, { deep: true })

// 计时器控制函数
function setMode(mode) {
  if (isRunning.value) return
  currentMode.value = mode
  timeLeft.value = currentModeDuration.value
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

function toggleTimer() {
  if (!currentTask.value && currentMode.value === 'work') {
    ElMessage.warning('请先选择一个任务')
    return
  }

  if (isRunning.value) {
    clearInterval(timerInterval.value)
  } else {
    timerInterval.value = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        handleTimerComplete()
      }
    }, 1000)
  }
  isRunning.value = !isRunning.value
}

function resetTimer() {
  clearInterval(timerInterval.value)
  isRunning.value = false
  timeLeft.value = currentModeDuration.value
}

function handleTimerComplete() {
  clearInterval(timerInterval.value)
  isRunning.value = false
  
  if (currentMode.value === 'work') {
    completedPomodoros.value++
    if (currentTask.value) {
      taskStore.incrementTaskPomodoro(currentTask.value.id)
    }
    
    // 播放提示音
    if (localSettings.value.soundEnabled) {
      const audio = new Audio('/notification.mp3')
      audio.play()
    }
    
    // 每完成4个番茄周期后，切换到长休息
    if (completedPomodoros.value % localSettings.value.longBreakInterval === 0) {
      setMode('longBreak')
    } else {
      setMode('shortBreak')
    }

    // 如果设置了自动开始休息，则自动开始计时
    if (localSettings.value.autoStartBreaks) {
      toggleTimer()
    }
  } else {
    setMode('work')
    // 如果设置了自动开始工作，则自动开始计时
    if (localSettings.value.autoStartPomodoros) {
      toggleTimer()
    }
  }
}

function skipBreak() {
  if (currentMode.value !== 'work') {
    setMode('work')
    if (localSettings.value.autoStartPomodoros) {
      toggleTimer()
    }
  }
}

// 任务相关函数
async function toggleTaskComplete(task, completed) {
  try {
    await taskStore.updateTask(task.id, { completed })
  } catch (error) {
    ElMessage.error('更新任务状态失败')
  }
}

function openEditDialog() {
  if (currentTask.value) {
    editForm.value = {
      dueDate: currentTask.value.dueDate || ''
    }
    showEditDialog.value = true
  }
}

function handleDialogClose() {
  showEditDialog.value = false
  if (currentTask.value) {
    editForm.value = {
      dueDate: currentTask.value.dueDate || ''
    }
  }
}

async function handleEditTask() {
  if (!currentTask.value) return

  try {
    const updatedTask = await taskStore.updateTask(currentTask.value.id, {
      dueDate: editForm.value.dueDate
    })
    taskStore.setCurrentTask(updatedTask)
    ElMessage.success('更新成功')
    showEditDialog.value = false
  } catch (error) {
    console.error('更新任务失败:', error)
    ElMessage.error('更新失败')
  }
}

function disablePastDates(time) {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

function formatDueDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return '明天'
  }
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

// 生命周期钩子
onMounted(async () => {
  try {
    await Promise.all([
      settingsStore.initSettings(),
      taskStore.fetchTasks()
    ])
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('初始化失败')
  }
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<style scoped>
.timer-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
  position: relative;
}

.timer-wrapper {
  position: relative;
  width: 100%;
  background: var(--card-bg, white);
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* 确保内容不会溢出圆角 */
}

.task-info-float {
  position: sticky;
  top: 0;
  background: var(--el-bg-color);
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
}

.task-info-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--el-text-color-secondary);
  font-size: 0.9rem;
}

.task-info-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-info-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.task-info-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.task-info-title .task-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-info-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--el-text-color-regular);
  font-size: 0.85rem;
}

.task-meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-meta-item .el-icon {
  font-size: 1rem;
  color: var(--el-text-color-secondary);
}

.due-date {
  color: var(--el-text-color-regular);
}

.due-date-overdue {
  color: var(--el-color-danger);
  font-weight: 500;
}

.task-description {
  color: var(--el-text-color-regular);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-category {
  color: var(--el-text-color-regular);
}

.task-info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.task-info-tags :deep(.el-tag) {
  height: 22px;
  padding: 0 8px;
  font-size: 0.8rem;
  border-radius: 4px;
}

.timer-container {
  padding: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timer-mode {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.timer-mode .el-button {
  min-width: 90px;
  height: 36px;
  border-radius: 1.5rem;
  transition: all 0.3s ease;
  border: none !important;
  font-size: 14px;
  padding: 0 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 浅色模式按钮样式 */
.timer-mode .el-button--primary {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: white;
}

.timer-mode .el-button--primary:hover {
  background-color: var(--el-color-primary-light-3);
  border-color: var(--el-color-primary-light-3);
}

.timer-mode .el-button--default {
  background-color: var(--el-fill-color-blank);
  border-color: var(--el-border-color);
  color: var(--el-text-color-regular);
}

.timer-mode .el-button--default:hover {
  background-color: var(--el-fill-color-light);
  border-color: var(--el-border-color-hover);
  color: var(--el-text-color-primary);
}

.timer-mode .el-button.is-disabled {
  background-color: var(--el-button-disabled-bg-color);
  border-color: var(--el-button-disabled-border-color);
  color: var(--el-button-disabled-text-color);
  opacity: var(--el-button-disabled-opacity);
}

.timer-display {
  position: relative;
  width: 280px;
  height: 280px;
  flex-shrink: 0;
  margin: 2rem auto;
}

.timer-display .time {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.75rem;
  font-weight: bold;
  color: var(--el-text-color-primary);
  background: transparent;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.progress-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.progress-ring svg {
  display: block;
}

.timer-controls {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.control-btn {
  min-width: 90px;
  height: 36px;
  border-radius: 1.5rem;
  font-size: 14px;
  padding: 0 1rem;
}

.timer-controls .control-btn {
  min-width: 90px;
  height: 36px;
  border-radius: 1.5rem;
  font-size: 14px;
  padding: 0 1rem;
}

.timer-controls .el-button--primary {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: white;
}

.timer-controls .el-button--primary:hover {
  background-color: var(--el-color-primary-light-3);
  border-color: var(--el-color-primary-light-3);
}

.timer-controls .el-button--info {
  background-color: var(--el-color-info);
  border-color: var(--el-color-info);
  color: white;
}

.timer-controls .el-button--info:hover {
  background-color: var(--el-color-info-light-3);
  border-color: var(--el-color-info-light-3);
}

.timer-scoreboard {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-color, #f5f7fa);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color, #e4e7ed);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
}

.scoreboard-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.scoreboard-item .el-icon {
  font-size: 1.5rem;
  color: var(--el-color-primary);
}

.scoreboard-item:nth-child(3) .el-icon {
  color: var(--el-color-success);
}

.scoreboard-label {
  font-size: 0.85rem;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.scoreboard-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}

.scoreboard-divider {
  width: 1px;
  height: 2rem;
  background: var(--border-color, #e4e7ed);
}

/* 深色模式样式 */
:deep(.dark-mode) .timer-wrapper {
  background: var(--el-bg-color);
}

:deep(.dark-mode) .task-info-float {
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color-darker);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
}

:deep(.dark-mode) .timer-scoreboard {
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color-darker);
}

:deep(.dark-mode) .task-info-title .task-title {
  color: var(--el-text-color-primary);
}

:deep(.dark-mode) .task-meta-item,
:deep(.dark-mode) .task-description,
:deep(.dark-mode) .task-category,
:deep(.dark-mode) .due-date {
  color: var(--el-text-color-regular);
}

:deep(.dark-mode) .scoreboard-label {
  color: var(--el-text-color-secondary);
}

:deep(.dark-mode) .scoreboard-value {
  color: var(--el-text-color-primary);
}

:deep(.dark-mode) .scoreboard-divider {
  background: var(--el-border-color-darker);
}

:deep(.dark-mode) .task-btn {
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
  color: white !important;
}

:deep(.dark-mode) .task-btn:hover {
  background-color: var(--el-color-primary-light-3) !important;
  border-color: var(--el-color-primary-light-3) !important;
}

:deep(.dark-mode) .timer-display .time {
  color: var(--el-text-color-primary);
}

:deep(.dark-mode) .progress-ring-circle-bg {
  stroke: var(--el-border-color-darker);
}

:deep(.dark-mode) .progress-ring-circle {
  stroke: var(--el-color-primary);
}

.task-btn {
  min-width: 90px !important;
  margin-left: 0.25rem;
}

.edit-task-btn {
  margin-left: auto;
  padding: 4px 8px;
  font-size: 0.85rem;
}

.edit-task-btn .el-icon {
  margin-right: 4px;
  font-size: 0.9rem;
}

.el-radio-button__inner {
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-radio-button__inner .el-icon {
  margin-right: 4px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-item .el-icon {
  font-size: 1.2em;
}

.score-item:nth-child(1) .el-icon {
  color: var(--el-color-primary);
}

.score-item:nth-child(2) .el-icon {
  color: var(--el-color-success);
}

.score-item:nth-child(3) .el-icon {
  color: var(--el-color-warning);
}

.radio-button-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.radio-button-content .el-icon {
  font-size: 1.2em;
}

.el-radio-button__inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-radio-button__inner .radio-button-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-radio-button__inner .el-icon {
  margin-right: 4px;
  font-size: 1.2em;
}

.el-radio-button.is-active .el-icon {
  color: inherit;
}

.skip-break-btn {
  min-width: 90px;
  height: 36px;
  border-radius: 1.5rem;
  font-size: 14px;
  padding: 0 1rem;
  background-color: var(--el-color-success);
  border: none;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.skip-break-btn:hover {
  background-color: var(--el-color-success-light-3);
}

.skip-break-btn .el-icon {
  font-size: 16px;
}

@media (max-width: 768px) {
  .timer-page {
    padding: 1rem;
  }

  .task-info-float {
    padding: 0.5rem 1rem;
    gap: 0.4rem;
  }

  .task-info-header {
    font-size: 0.85rem;
  }

  .task-info-title .task-title {
    font-size: 0.95rem;
  }

  .task-info-meta,
  .task-info-description {
    font-size: 0.8rem;
  }

  .task-info-tags :deep(.el-tag) {
    height: 20px;
    padding: 0 6px;
    font-size: 0.75rem;
  }

  .timer-scoreboard {
    margin-top: 1rem;
    padding: 0.75rem;
    gap: 1rem;
  }

  .scoreboard-item {
    min-width: 100px;
  }

  .scoreboard-label {
    font-size: 0.75rem;
  }

  .scoreboard-value {
    font-size: 1.25rem;
  }

  .scoreboard-divider {
    height: 1.5rem;
  }

  .timer-display {
    width: 240px;
    height: 240px;
    margin: 1.5rem auto;
  }

  .timer-display .time {
    font-size: 2.25rem;
  }

  .timer-mode .el-button,
  .task-btn,
  .skip-break-btn,
  .control-btn {
    min-width: 80px;
    height: 32px;
    font-size: 13px;
    padding: 0 0.75rem;
  }
}

.mode-icon {
  font-size: 1.2em;
  margin-right: 8px;
}

.mode-icon.focus {
  color: var(--el-color-primary);
}

.mode-icon.short-break {
  color: var(--el-color-success);
}

.mode-icon.long-break {
  color: var(--el-color-warning);
}

.el-radio-button__inner {
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-radio-button__inner .el-icon {
  margin-right: 4px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-item .el-icon {
  font-size: 1.2em;
}

.score-item:nth-child(1) .el-icon {
  color: var(--el-color-primary);
}

.score-item:nth-child(2) .el-icon {
  color: var(--el-color-success);
}

.score-item:nth-child(3) .el-icon {
  color: var(--el-color-warning);
}

.radio-button-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.radio-button-content .el-icon {
  font-size: 1.2em;
}

.el-radio-button__inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-radio-button__inner .radio-button-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-radio-button__inner .el-icon {
  margin-right: 4px;
  font-size: 1.2em;
}

.el-radio-button.is-active .el-icon {
  color: inherit;
}

.skip-break-btn {
  min-width: 90px;
  height: 36px;
  border-radius: 1.5rem;
  font-size: 14px;
  padding: 0 1rem;
  background-color: var(--el-color-success);
  border: none;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.skip-break-btn:hover {
  background-color: var(--el-color-success-light-3);
}

.skip-break-btn .el-icon {
  font-size: 16px;
}

/* 对话框样式 */
:deep(.el-dialog) {
  background: var(--el-bg-color);
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-dialog__title) {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

:deep(.el-dialog__headerbtn) {
  top: 20px;
  right: 20px;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: var(--el-text-color-secondary);
}

:deep(.el-dialog__body) {
  padding: 20px;
  color: var(--el-text-color-regular);
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

/* 表单元素样式 */
:deep(.el-form-item__label) {
  color: var(--el-text-color-regular);
}

:deep(.el-input__wrapper) {
  background-color: var(--el-bg-color);
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
}

:deep(.el-input__inner) {
  color: var(--el-text-color-regular);
}

:deep(.el-input__inner::placeholder) {
  color: var(--el-text-color-placeholder);
}

:deep(.dark-mode) .el-input__wrapper {
  background-color: var(--el-bg-color-overlay);
  box-shadow: 0 0 0 1px var(--el-border-color-darker) inset;
}

:deep(.dark-mode) .el-input__inner {
  color: var(--el-text-color-regular);
}

:deep(.dark-mode) .el-input__inner::placeholder {
  color: var(--el-text-color-placeholder);
}

/* 日期选择器样式 */
:deep(.el-date-picker) {
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
}

:deep(.el-date-picker__header) {
  color: var(--el-text-color-regular);
}

:deep(.el-date-table th) {
  color: var(--el-text-color-regular);
}

:deep(.el-date-table td) {
  color: var(--el-text-color-regular);
}

:deep(.el-date-table td.available:hover) {
  color: var(--el-color-primary);
}

:deep(.el-date-table td.current:not(.disabled) span) {
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
}

:deep(.dark-mode) .el-date-picker {
  background-color: var(--el-bg-color-overlay);
  border-color: var(--el-border-color-darker);
}

:deep(.dark-mode) .el-date-picker__header {
  color: var(--el-text-color-regular);
}

:deep(.dark-mode) .el-date-table th {
  color: var(--el-text-color-regular);
}

:deep(.dark-mode) .el-date-table td {
  color: var(--el-text-color-regular);
}

:deep(.dark-mode) .el-date-table td.available:hover {
  color: var(--el-color-primary);
}

:deep(.dark-mode) .el-date-table td.current:not(.disabled) span {
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
}
</style> 