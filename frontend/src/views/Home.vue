<template>
  <div class="home">
    <div class="welcome-card">
      <h1>欢迎使用番茄时钟</h1>
      <p>通过番茄工作法提高您的工作效率</p>
      <el-button type="primary" @click="$router.push('/timer')">
        开始专注
      </el-button>
    </div>

    <div class="task-overview">
      <h2>任务概览</h2>
      <div class="task-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><List /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ incompleteTasksCount }}</div>
            <div class="stat-label">未完成任务</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ todayPomodorosCount }}</div>
            <div class="stat-label">今日番茄数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ completedTasksCount }}</div>
            <div class="stat-label">已完成任务</div>
          </div>
        </div>
      </div>

      <div class="recent-tasks">
        <div class="section-header">
          <h3>最近任务</h3>
          <el-button type="primary" link @click="$router.push('/tasks')">
            查看全部
          </el-button>
        </div>
        <div class="task-list">
          <div v-for="task in recentTasks" :key="task.id" class="task-item">
            <div class="task-info">
              <span class="task-title" :class="{ completed: task.completed }">
                {{ task.title }}
              </span>
              <span class="task-progress">
                {{ task.completedPomodoros }}/{{ task.estimatedPomodoros }}
              </span>
            </div>
            <el-progress
              :percentage="(task.completedPomodoros / task.estimatedPomodoros) * 100"
              :color="task.completed ? '#67C23A' : '#ff6347'"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTaskStore } from '../store/task'
import { List, Timer, CircleCheck } from '@element-plus/icons-vue'

const taskStore = useTaskStore()

// 计算属性：未完成任务数量
const incompleteTasksCount = computed(() => {
  return taskStore.tasks.filter(task => !task.completed).length
})

// 计算属性：今日完成的番茄钟数量
const todayPomodorosCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return taskStore.tasks.reduce((count, task) => {
    if (task.updatedAt?.startsWith(today)) {
      return count + (task.completedPomodoros || 0)
    }
    return count
  }, 0)
})

// 计算属性：已完成任务数量
const completedTasksCount = computed(() => {
  return taskStore.tasks.filter(task => task.completed).length
})

// 计算属性：最近任务（最多显示5个）
const recentTasks = computed(() => {
  return [...taskStore.tasks]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
})

onMounted(() => {
  // 初始化任务列表
  taskStore.fetchTasks()
})
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.welcome-card {
  background: var(--card-bg, white);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.welcome-card h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.welcome-card p {
  font-size: 1.1rem;
  color: var(--text-color-secondary);
  margin-bottom: 1.5rem;
}

.task-overview {
  background: var(--card-bg, white);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.task-overview h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.task-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-color);
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  border-radius: 12px;
  color: white;
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.recent-tasks {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: var(--bg-color);
  padding: 1rem;
  border-radius: 0.5rem;
}

.task-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title {
  font-weight: 500;
  color: var(--text-color);
}

.task-title.completed {
  text-decoration: line-through;
  color: var(--text-color-secondary);
}

.task-progress {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

/* 深色模式样式 */
:deep(.dark-mode) .welcome-card,
:deep(.dark-mode) .task-overview {
  background: var(--card-bg, #1a1a1a);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

:deep(.dark-mode) .stat-card {
  background: var(--bg-color, #2c2c2c);
}

:deep(.dark-mode) .task-item {
  background: var(--bg-color, #2c2c2c);
}

:deep(.dark-mode) .el-progress-bar__outer {
  background-color: var(--bg-color, #2c2c2c);
}

:deep(.dark-mode) .el-progress-bar__inner {
  background-color: var(--primary-color);
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .welcome-card {
    padding: 1.5rem;
  }

  .welcome-card h1 {
    font-size: 1.5rem;
  }

  .task-overview {
    padding: 1.5rem;
  }

  .task-stats {
    grid-template-columns: 1fr;
  }
}
</style> 