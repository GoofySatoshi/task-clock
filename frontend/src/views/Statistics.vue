<template>
  <div class="statistics-container">
    <div class="statistics-header">
      <h1>统计</h1>
      <div class="date-range-buttons">
        <el-radio-group v-model="dateRange" @change="handleDateRangeChange">
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
          <el-radio-button label="year">本年</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <el-skeleton :loading="loading" animated :count="4" v-if="loading">
      <template #template>
        <div class="stat-card skeleton">
          <div class="stat-header"></div>
          <div class="stat-content"></div>
        </div>
      </template>
    </el-skeleton>

    <template v-else>
      <!-- 统计卡片 -->
      <div class="stat-cards">
        <div v-for="stat in trendIndicators" :key="stat.title" class="stat-card">
          <div class="stat-header">
            <el-icon><component :is="stat.icon" /></el-icon>
            <span>{{ stat.title }}</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-trend" :class="{ up: stat.trend > 0, down: stat.trend < 0 }">
              <el-icon>
                <component :is="stat.trend > 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
              <span>{{ Math.abs(Math.round(stat.trend)) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表 -->
      <div class="charts-container">
        <div class="chart-card">
          <div id="trendChart" class="chart"></div>
        </div>
        <div class="chart-card">
          <div id="categoryChart" class="chart"></div>
        </div>
      </div>

      <!-- 任务完成情况 -->
      <div class="task-completion">
        <h2>任务完成情况</h2>
        <div class="task-list">
          <div v-for="task in taskStore.tasks.slice(0, 5)" :key="task.id" class="task-item">
            <div class="task-info">
              <span class="task-title">{{ task.title }}</span>
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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../store/task'
import { statisticsApi } from '../api'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const taskStore = useTaskStore()
const loading = ref(false)
const dateRange = ref('week') // 'week', 'month', 'year'
const statistics = ref(null)
const dailyStats = ref([])
const categoryStats = ref([])

// 获取统计数据
const fetchStatistics = async () => {
  try {
    loading.value = true
    const [stats, daily, categories] = await Promise.all([
      statisticsApi.getStatistics(),
      statisticsApi.getDailyStats(),
      statisticsApi.getTaskCategoryStats()
    ])
    statistics.value = stats
    dailyStats.value = daily
    categoryStats.value = categories
    initCharts()
  } catch (error) {
    ElMessage.error('获取统计数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  // 初始化每日番茄钟趋势图
  const trendChart = echarts.init(document.getElementById('trendChart'))
  const trendOption = {
    title: {
      text: '每日番茄钟趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: statistics.value.weeklyTrend.dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '番茄钟数',
        type: 'line',
        smooth: true,
        data: statistics.value.weeklyTrend.pomodoros,
        itemStyle: {
          color: '#ff6347'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 99, 71, 0.3)' },
            { offset: 1, color: 'rgba(255, 99, 71, 0.1)' }
          ])
        }
      }
    ]
  }
  trendChart.setOption(trendOption)

  // 初始化任务分类统计图
  const categoryChart = echarts.init(document.getElementById('categoryChart'))
  const categoryOption = {
    title: {
      text: '任务分类统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: categoryStats.value.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color }
        }))
      }
    ]
  }
  categoryChart.setOption(categoryOption)

  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    trendChart.resize()
    categoryChart.resize()
  })
}

// 计算属性：趋势指标
const trendIndicators = computed(() => {
  if (!statistics.value) return []
  
  const { weeklyTrend } = statistics.value
  const currentWeek = weeklyTrend.pomodoros.slice(-7)
  const lastWeek = weeklyTrend.pomodoros.slice(-14, -7)
  
  const calculateTrend = (current, last) => {
    const currentAvg = current.reduce((a, b) => a + b, 0) / current.length
    const lastAvg = last.reduce((a, b) => a + b, 0) / last.length
    return ((currentAvg - lastAvg) / lastAvg) * 100
  }

  return [
    {
      title: '总番茄钟数',
      value: statistics.value.totalPomodoros,
      trend: calculateTrend(currentWeek, lastWeek),
      icon: 'Timer'
    },
    {
      title: '完成任务数',
      value: statistics.value.completedTasks,
      trend: calculateTrend(
        weeklyTrend.tasks.slice(-7),
        weeklyTrend.tasks.slice(-14, -7)
      ),
      icon: 'CheckCircle'
    },
    {
      title: '专注时间',
      value: `${Math.floor(statistics.value.totalFocusTime / 60)}小时${statistics.value.totalFocusTime % 60}分钟`,
      trend: calculateTrend(currentWeek, lastWeek),
      icon: 'Clock'
    },
    {
      title: '平均每日番茄数',
      value: Math.round(statistics.value.totalPomodoros / dailyStats.value.length),
      trend: calculateTrend(currentWeek, lastWeek),
      icon: 'TrendingUp'
    }
  ]
})

// 切换日期范围
const handleDateRangeChange = async (range) => {
  dateRange.value = range
  try {
    loading.value = true
    const endDate = new Date().toISOString().split('T')[0]
    let startDate
    
    switch (range) {
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        break
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        break
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        break
    }
    
    const stats = await statisticsApi.getDateRangeStats(startDate, endDate)
    dailyStats.value = stats
    initCharts()
  } catch (error) {
    ElMessage.error('获取日期范围统计数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取统计数据
onMounted(fetchStatistics)
</script>

<style scoped>
.statistics-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.statistics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  margin-bottom: 15px;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.stat-trend.up {
  color: #67C23A;
}

.stat-trend.down {
  color: #F56C6C;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart {
  height: 300px;
}

.task-completion {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.task-completion h2 {
  margin-bottom: 20px;
  color: #333;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title {
  font-weight: 500;
  color: #333;
}

.task-progress {
  font-size: 14px;
  color: #666;
}

.skeleton {
  height: 120px;
  background: #f5f7fa;
  border-radius: 8px;
}

.skeleton .stat-header {
  height: 24px;
  background: #e4e7ed;
  border-radius: 4px;
  margin-bottom: 15px;
}

.skeleton .stat-content {
  height: 40px;
  background: #e4e7ed;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .statistics-container {
    padding: 10px;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .chart {
    height: 250px;
  }
}
</style> 