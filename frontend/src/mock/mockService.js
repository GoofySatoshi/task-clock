import tasksData from './tasks.json'
import statisticsData from './statistics.json'
import categoryData from './tasks_category.json'
import priorityData from './tasks_priority.json'
import soundsData from './sounds.json'
import { ElMessage } from 'element-plus'

// 模拟网络延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟随机错误
const simulateError = () => {
  const random = Math.random()
  if (random < 0.1) { // 10% 的概率发生错误
    throw new Error('模拟网络错误')
  }
}

// 获取任务数组的辅助函数
const getTasksArray = () => {
  // 合并所有任务数据
  const allTasks = [
    ...(Array.isArray(tasksData.tasks) ? tasksData.tasks : []),
    ...(Array.isArray(priorityData.priorityTasks) ? priorityData.priorityTasks.map(task => ({
      ...task,
      completed: false,
      completedPomodoros: 0,
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || new Date().toISOString()
    })) : [])
  ]
  return allTasks
}

// 获取统计数据的辅助函数
const getStatisticsData = () => {
  return statisticsData || {}
}

// 获取分类数据的辅助函数
const getCategoryData = () => {
  return categoryData || {}
}

// 获取优先级数据的辅助函数
const getPriorityData = () => {
  return priorityData || {}
}

// 获取提示音数据的辅助函数
const getSoundsData = () => {
  return soundsData || {}
}

// 模拟 API 服务
export const mockService = {
  // 任务相关 API
  tasks: {
    // 获取任务列表
    async getTasks(params = {}) {
      await delay(300)
      simulateError()
      
      let tasks = getTasksArray()
      
      // 处理过滤条件
      if (params.completed !== undefined) {
        tasks = tasks.filter(task => task.completed === params.completed)
      }
      
      // 处理标签过滤
      if (params.tags && params.tags.length > 0) {
        tasks = tasks.filter(task => 
          params.tags.some(tag => task.tags.includes(tag))
        )
      }
      
      // 处理搜索
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        tasks = tasks.filter(task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
        )
      }
      
      // 处理排序
      if (params.sortBy) {
        tasks.sort((a, b) => {
          const aValue = a[params.sortBy]
          const bValue = b[params.sortBy]
          if (typeof aValue === 'string') {
            return params.sortOrder === 'desc' 
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue)
          }
          return params.sortOrder === 'desc' 
            ? bValue - aValue 
            : aValue - bValue
        })
      }
      
      // 直接返回任务数组，而不是包装对象
      return tasks
    },

    // 添加任务
    async addTask(task) {
      await delay(500)
      simulateError()
      
      const tasks = getTasksArray()
      const newTask = {
        ...task,
        id: String(Date.now()),
        completed: false,
        completedPomodoros: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      tasks.push(newTask)
      return newTask
    },

    // 更新任务
    async updateTask(id, updates) {
      await delay(400)
      simulateError()
      
      const tasks = getTasksArray()
      const index = tasks.findIndex(task => task.id === id)
      
      if (index === -1) {
        throw new Error('任务不存在')
      }
      
      const updatedTask = {
        ...tasks[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      tasks[index] = updatedTask
      return updatedTask
    },

    // 删除任务
    async deleteTask(id) {
      await delay(300)
      simulateError()
      
      const tasks = getTasksArray()
      const index = tasks.findIndex(task => task.id === id)
      
      if (index === -1) {
        throw new Error('任务不存在')
      }
      
      tasks.splice(index, 1)
      return { success: true }
    },

    // 增加番茄钟计数
    async incrementTaskPomodoro(id) {
      await delay(200)
      simulateError()
      
      const tasks = getTasksArray()
      const index = tasks.findIndex(task => task.id === id)
      
      if (index === -1) {
        throw new Error('任务不存在')
      }
      
      const task = tasks[index]
      task.completedPomodoros = (task.completedPomodoros || 0) + 1
      task.updatedAt = new Date().toISOString()
      
      return task
    },

    // 批量更新任务
    async batchUpdateTasks(updates) {
      await delay(600)
      simulateError()
      
      const tasks = getTasksArray()
      const updatedTasks = []
      
      for (const update of updates) {
        const index = tasks.findIndex(task => task.id === update.id)
        if (index !== -1) {
          const updatedTask = {
            ...tasks[index],
            ...update,
            updatedAt: new Date().toISOString()
          }
          tasks[index] = updatedTask
          updatedTasks.push(updatedTask)
        }
      }
      
      return updatedTasks
    },

    // 添加学习笔记
    async addLearningNote(taskId, note) {
      await delay(300)
      simulateError()
      
      const tasks = getTasksArray()
      const index = tasks.findIndex(task => task.id === taskId)
      
      if (index === -1) {
        throw new Error('任务不存在')
      }
      
      if (!tasks[index].learning) {
        tasks[index].learning = {
          type: 'tutorial',
          progress: 0,
          notes: [],
          resources: [],
          milestones: []
        }
      }
      
      const newNote = {
        id: `note${Date.now()}`,
        content: note.content,
        createdAt: new Date().toISOString()
      }
      
      tasks[index].learning.notes.push(newNote)
      tasks[index].updatedAt = new Date().toISOString()
      
      return newNote
    },

    // 更新学习进度
    async updateLearningProgress(taskId, progress) {
      await delay(300)
      simulateError()
      
      const tasks = getTasksArray()
      const index = tasks.findIndex(task => task.id === taskId)
      
      if (index === -1) {
        throw new Error('任务不存在')
      }
      
      if (!tasks[index].learning) {
        tasks[index].learning = {
          type: 'tutorial',
          progress: 0,
          notes: [],
          resources: [],
          milestones: []
        }
      }
      
      tasks[index].learning.progress = Math.min(Math.max(progress, 0), 1)
      tasks[index].updatedAt = new Date().toISOString()
      
      return tasks[index].learning
    },

    // 添加学习资源
    async addLearningResource(taskId, resource) {
      await delay(300)
      simulateError()
      
      const tasks = getTasksArray()
      const index = tasks.findIndex(task => task.id === taskId)
      
      if (index === -1) {
        throw new Error('任务不存在')
      }
      
      if (!tasks[index].learning) {
        tasks[index].learning = {
          type: 'tutorial',
          progress: 0,
          notes: [],
          resources: [],
          milestones: []
        }
      }
      
      const newResource = {
        id: `res${Date.now()}`,
        ...resource
      }
      
      tasks[index].learning.resources.push(newResource)
      tasks[index].updatedAt = new Date().toISOString()
      
      return newResource
    },

    // 添加学习里程碑
    async addLearningMilestone(taskId, milestone) {
      await delay(300)
      simulateError()
      
      const tasks = getTasksArray()
      const index = tasks.findIndex(task => task.id === taskId)
      
      if (index === -1) {
        throw new Error('任务不存在')
      }
      
      if (!tasks[index].learning) {
        tasks[index].learning = {
          type: 'tutorial',
          progress: 0,
          notes: [],
          resources: [],
          milestones: []
        }
      }
      
      const newMilestone = {
        id: `mil${Date.now()}`,
        ...milestone,
        completed: false
      }
      
      tasks[index].learning.milestones.push(newMilestone)
      tasks[index].updatedAt = new Date().toISOString()
      
      return newMilestone
    },

    // 更新学习里程碑状态
    async updateLearningMilestone(taskId, milestoneId, completed) {
      await delay(300)
      simulateError()
      
      const tasks = getTasksArray()
      const taskIndex = tasks.findIndex(task => task.id === taskId)
      
      if (taskIndex === -1) {
        throw new Error('任务不存在')
      }
      
      if (!tasks[taskIndex].learning?.milestones) {
        throw new Error('任务没有学习里程碑')
      }
      
      const milestoneIndex = tasks[taskIndex].learning.milestones.findIndex(
        m => m.id === milestoneId
      )
      
      if (milestoneIndex === -1) {
        throw new Error('里程碑不存在')
      }
      
      tasks[taskIndex].learning.milestones[milestoneIndex].completed = completed
      if (completed) {
        tasks[taskIndex].learning.milestones[milestoneIndex].completedAt = new Date().toISOString()
      } else {
        delete tasks[taskIndex].learning.milestones[milestoneIndex].completedAt
      }
      
      tasks[taskIndex].updatedAt = new Date().toISOString()
      
      return tasks[taskIndex].learning.milestones[milestoneIndex]
    },

    // 删除学习笔记
    async deleteLearningNote(taskId, noteId) {
      await delay(300)
      simulateError()
      
      const tasks = getTasksArray()
      const taskIndex = tasks.findIndex(task => task.id === taskId)
      
      if (taskIndex === -1) {
        throw new Error('任务不存在')
      }
      
      if (!tasks[taskIndex].learning?.notes) {
        throw new Error('任务没有学习笔记')
      }
      
      const noteIndex = tasks[taskIndex].learning.notes.findIndex(
        n => n.id === noteId
      )
      
      if (noteIndex === -1) {
        throw new Error('笔记不存在')
      }
      
      tasks[taskIndex].learning.notes.splice(noteIndex, 1)
      tasks[taskIndex].updatedAt = new Date().toISOString()
      
      return { success: true }
    },

    // 删除学习资源
    async deleteLearningResource(taskId, resourceId) {
      await delay(300)
      simulateError()
      
      const tasks = getTasksArray()
      const taskIndex = tasks.findIndex(task => task.id === taskId)
      
      if (taskIndex === -1) {
        throw new Error('任务不存在')
      }
      
      if (!tasks[taskIndex].learning?.resources) {
        throw new Error('任务没有学习资源')
      }
      
      const resourceIndex = tasks[taskIndex].learning.resources.findIndex(
        r => r.id === resourceId
      )
      
      if (resourceIndex === -1) {
        throw new Error('资源不存在')
      }
      
      tasks[taskIndex].learning.resources.splice(resourceIndex, 1)
      tasks[taskIndex].updatedAt = new Date().toISOString()
      
      return { success: true }
    }
  },

  // 统计相关 API
  statistics: {
    // 获取统计数据
    async getStatistics(params = {}) {
      await delay(400)
      simulateError()
      
      const statistics = getStatisticsData()
      const tasks = getTasksArray()
      
      // 计算每日统计数据
      const dailyStats = statistics.dailyStats || []
      const today = new Date().toISOString().split('T')[0]
      
      // 计算本周趋势数据
      const dates = []
      const pomodoros = []
      const completedTasks = []
      
      // 生成过去7天的日期
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        dates.push(dateStr)
        
        // 计算当天的番茄数和完成任务数
        const dayStats = dailyStats.find(stat => stat.date === dateStr) || {
          date: dateStr,
          pomodoros: 0,
          completedTasks: 0
        }
        
        pomodoros.push(dayStats.pomodoros)
        completedTasks.push(dayStats.completedTasks)
      }
      
      // 返回标准化的统计数据
      return {
        totalPomodoros: statistics.totalPomodoros || 0,
        completedTasks: statistics.completedTasks || 0,
        totalFocusTime: statistics.totalFocusTime || 0,
        dailyStats: dailyStats,
        weeklyTrend: {
          dates,
          pomodoros,
          tasks: completedTasks
        },
        categoryStats: statistics.categoryStats || [],
        monthlyTrend: statistics.monthlyTrend || { dates: [], pomodoros: [], tasks: [] },
        tags: statistics.tags || {},
        summary: statistics.summary || {}
      }
    },

    // 更新统计数据
    async updateStatistics(updates) {
      await delay(300)
      simulateError()
      
      const statistics = getStatisticsData()
      const updatedStats = {
        ...statistics,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      // 更新每日统计
      if (updates.dailyStats) {
        const today = new Date().toISOString().split('T')[0]
        const dailyStats = statistics.dailyStats || []
        const index = dailyStats.findIndex(stat => stat.date === today)
        
        if (index !== -1) {
          dailyStats[index] = {
            ...dailyStats[index],
            ...updates.dailyStats
          }
        } else {
          dailyStats.push({
            date: today,
            ...updates.dailyStats
          })
        }
        updatedStats.dailyStats = dailyStats
      }
      
      // 更新分类统计
      if (updates.categoryStats) {
        updatedStats.categoryStats = {
          ...statistics.categoryStats,
          ...updates.categoryStats
        }
      }
      
      // 更新标签统计
      if (updates.tags) {
        updatedStats.tags = {
          ...statistics.tags,
          ...updates.tags
        }
      }
      
      return updatedStats
    },

    // 获取任务分类统计
    async getTaskCategoryStats() {
      await delay(300)
      simulateError()
      
      const tasks = getTasksArray()
      const tagStats = {}
      
      // 统计每个标签的任务数量
      tasks.forEach(task => {
        task.tags.forEach(tag => {
          if (!tagStats[tag]) {
            tagStats[tag] = {
              name: tag,
              value: 0,
              color: getRandomColor()
            }
          }
          tagStats[tag].value++
        })
      })
      
      // 转换为数组格式
      return Object.values(tagStats)
    },

    // 获取每日统计数据
    async getDailyStats() {
      await delay(300)
      simulateError()
      
      const statistics = getStatisticsData()
      return statistics.dailyStats || []
    },

    // 更新每日统计数据
    async updateDailyStats(dailyStat) {
      await delay(300)
      simulateError()
      
      const statistics = getStatisticsData()
      const dailyStats = statistics.dailyStats || []
      const index = dailyStats.findIndex(stat => stat.date === dailyStat.date)
      
      if (index !== -1) {
        dailyStats[index] = dailyStat
      } else {
        dailyStats.push(dailyStat)
      }
      
      return dailyStats
    },

    // 获取标签统计
    async getTagStatistics() {
      await delay(300)
      simulateError()
      
      const statistics = getStatisticsData()
      return statistics.tags || {}
    },

    // 获取时间范围统计
    async getTimeRangeStatistics(range, startDate, endDate) {
      await delay(500)
      simulateError()
      
      const statistics = getStatisticsData()
      const rangeData = statistics[range] || {}
      
      // 过滤日期范围内的数据
      const filteredData = {}
      for (const [key, value] of Object.entries(rangeData)) {
        // 根据不同的范围类型处理日期
        let date
        if (range === 'daily') {
          date = key // 格式：YYYY-MM-DD
        } else if (range === 'weekly') {
          // 格式：YYYY-Www
          const [year, week] = key.split('-W')
          date = new Date(year, 0, 1 + (parseInt(week) - 1) * 7)
        } else if (range === 'monthly') {
          // 格式：YYYY-MM
          const [year, month] = key.split('-')
          date = new Date(year, parseInt(month) - 1, 1)
        }
        
        // 检查日期是否在范围内
        if (date >= new Date(startDate) && date <= new Date(endDate)) {
          filteredData[key] = value
        }
      }
      
      return filteredData
    }
  },

  // 设置相关 API
  settings: {
    // 获取设置
    async getSettings() {
      await delay(200)
      simulateError()
      
      const defaultSettings = {
        theme: 'light',
        language: 'zh-CN',
        pomodoroDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        notifications: true,
        sound: true,
        volume: 0.5,
        showTimerInTitle: true,
        showNotifications: true,
        showDesktopNotifications: true,
        showSystemTray: true,
        minimizeToTray: true,
        startWithSystem: false,
        darkMode: false,
        compactMode: false,
        showCompletedTasks: true,
        showTaskCount: true,
        showPomodoroCount: true,
        showTimeSpent: true,
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        firstDayOfWeek: 1
      }
      
      // 从 localStorage 获取保存的设置
      const savedSettings = localStorage.getItem('settings')
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings
    },

    // 更新设置
    async updateSettings(settings) {
      await delay(300)
      simulateError()
      
      // 保存到 localStorage
      localStorage.setItem('settings', JSON.stringify(settings))
      return settings
    },

    // 重置设置
    async resetSettings() {
      await delay(200)
      simulateError()
      
      localStorage.removeItem('settings')
      return this.getSettings()
    }
  },

  // 分类相关 API
  categories: {
    // 获取所有分类
    async getCategories() {
      await delay(300)
      simulateError()
      return getCategoryData().categories || []
    },

    // 获取分类统计
    async getCategoryStats() {
      await delay(300)
      simulateError()
      return getCategoryData().categoryStats || {}
    },

    // 获取标签规则
    async getTagRules() {
      await delay(200)
      simulateError()
      return getCategoryData().tagRules || {}
    }
  },

  // 优先级相关 API
  priorities: {
    // 获取优先级级别
    async getPriorityLevels() {
      await delay(200)
      simulateError()
      return getPriorityData().priorityLevels || []
    },

    // 获取提醒设置
    async getReminderSettings() {
      await delay(200)
      simulateError()
      return getPriorityData().reminderSettings || {}
    },

    // 获取优先级规则
    async getPriorityRules() {
      await delay(200)
      simulateError()
      return getPriorityData().priorityRules || {}
    }
  },

  // 提示音相关 API
  sounds: {
    // 获取默认提示音列表
    async getDefaultSounds() {
      await delay(200)
      simulateError()
      return getSoundsData().defaultSounds || []
    },

    // 获取自定义提示音列表
    async getCustomSounds() {
      await delay(200)
      simulateError()
      return getSoundsData().customSounds || []
    },

    // 获取提示音设置
    async getSoundSettings() {
      await delay(200)
      simulateError()
      return getSoundsData().soundSettings || {}
    },

    // 更新提示音设置
    async updateSoundSettings(settings) {
      await delay(300)
      simulateError()
      const sounds = getSoundsData()
      sounds.soundSettings = {
        ...sounds.soundSettings,
        ...settings
      }
      return sounds.soundSettings
    },

    // 添加自定义提示音
    async addCustomSound(sound) {
      await delay(400)
      simulateError()
      const sounds = getSoundsData()
      const customSounds = sounds.customSounds || []
      
      // 检查自定义提示音数量限制
      if (customSounds.length >= sounds.soundRules.maxCustomSounds) {
        throw new Error('已达到最大自定义提示音数量限制')
      }

      // 检查文件大小
      if (sound.fileSize > sounds.soundRules.maxFileSize) {
        throw new Error('文件大小超过限制')
      }

      // 检查文件格式
      const fileExt = sound.url.split('.').pop().toLowerCase()
      if (!sounds.soundRules.allowedFormats.includes(fileExt)) {
        throw new Error('不支持的文件格式')
      }

      // 检查音频时长
      if (sound.duration < sounds.soundRules.minDuration || 
          sound.duration > sounds.soundRules.maxDuration) {
        throw new Error('音频时长不符合要求')
      }

      const newSound = {
        ...sound,
        id: `custom${Date.now()}`,
        uploadedAt: new Date().toISOString()
      }
      
      customSounds.push(newSound)
      return newSound
    },

    // 删除自定义提示音
    async deleteCustomSound(soundId) {
      await delay(300)
      simulateError()
      const sounds = getSoundsData()
      const customSounds = sounds.customSounds || []
      const index = customSounds.findIndex(sound => sound.id === soundId)
      
      if (index === -1) {
        throw new Error('提示音不存在')
      }

      // 检查是否正在使用
      const settings = sounds.soundSettings || {}
      const isInUse = Object.values(settings).some(
        setting => setting.soundId === soundId
      )
      
      if (isInUse) {
        throw new Error('该提示音正在使用中，无法删除')
      }

      customSounds.splice(index, 1)
      return { success: true }
    }
  }
}

// 错误处理中间件
export const errorHandler = (error) => {
  console.error('API Error:', error)
  ElMessage.error(error.message || '操作失败，请重试')
  throw error
}

// 导出带错误处理的 API 服务
export const apiService = {
  tasks: Object.fromEntries(
    Object.entries(mockService.tasks).map(([key, fn]) => [
      key,
      async (...args) => {
        try {
          return await fn(...args)
        } catch (error) {
          return errorHandler(error)
        }
      }
    ])
  ),
  
  statistics: Object.fromEntries(
    Object.entries(mockService.statistics).map(([key, fn]) => [
      key,
      async (...args) => {
        try {
          return await fn(...args)
        } catch (error) {
          return errorHandler(error)
        }
      }
    ])
  ),
  
  settings: Object.fromEntries(
    Object.entries(mockService.settings).map(([key, fn]) => [
      key,
      async (...args) => {
        try {
          return await fn(...args)
        } catch (error) {
          return errorHandler(error)
        }
      }
    ])
  ),

  categories: Object.fromEntries(
    Object.entries(mockService.categories).map(([key, fn]) => [
      key,
      async (...args) => {
        try {
          return await fn(...args)
        } catch (error) {
          return errorHandler(error)
        }
      }
    ])
  ),

  priorities: Object.fromEntries(
    Object.entries(mockService.priorities).map(([key, fn]) => [
      key,
      async (...args) => {
        try {
          return await fn(...args)
        } catch (error) {
          return errorHandler(error)
        }
      }
    ])
  ),

  sounds: Object.fromEntries(
    Object.entries(mockService.sounds).map(([key, fn]) => [
      key,
      async (...args) => {
        try {
          return await fn(...args)
        } catch (error) {
          return errorHandler(error)
        }
      }
    ])
  )
}

// 生成随机颜色的辅助函数
function getRandomColor() {
  const colors = [
    '#ff6347', // tomato
    '#4682b4', // steelblue
    '#32cd32', // limegreen
    '#ffa500', // orange
    '#9370db', // mediumpurple
    '#20b2aa', // lightseagreen
    '#ff69b4', // hotpink
    '#1e90ff', // dodgerblue
    '#7b68ee', // mediumslateblue
    '#3cb371'  // mediumseagreen
  ]
  return colors[Math.floor(Math.random() * colors.length)]
} 