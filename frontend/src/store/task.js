// import { defineStore } from 'pinia'
// import { taskApi, statisticsApi } from '../api'
//
// export const useTaskStore = defineStore('task', {
//   state: () => ({
//     tasks: [],
//     currentTask: null,
//     statistics: {
//       totalPomodoros: 0,
//       completedTasks: 0,
//       totalFocusTime: 0,
//       dailyStats: []
//     }
//   }),
//
//   actions: {
//     async fetchTasks() {
//       try {
//         const tasks = await taskApi.getTasks()
//         this.tasks = Array.isArray(tasks) ? tasks : []
//         await this.updateStatistics()
//       } catch (error) {
//         console.error('获取任务失败:', error)
//         throw error
//       }
//     },
//
//     async addTask(task) {
//       try {
//         const newTask = await taskApi.addTask(task)
//         this.tasks.push(newTask)
//         await this.updateStatistics()
//       } catch (error) {
//         console.error('添加任务失败:', error)
//         throw error
//       }
//     },
//
//     async updateTask(id, updates) {
//       try {
//         const updatedTask = await taskApi.updateTask(id, updates)
//         const index = this.tasks.findIndex(t => t.id === id)
//         if (index !== -1) {
//           this.tasks[index] = updatedTask
//         }
//         await this.updateStatistics()
//         return updatedTask
//       } catch (error) {
//         console.error('更新任务失败:', error)
//         throw error
//       }
//     },
//
//     async deleteTask(taskId) {
//       try {
//         await taskApi.deleteTask(taskId)
//         const index = this.tasks.findIndex(t => t.id === taskId)
//         if (index !== -1) {
//           this.tasks.splice(index, 1)
//           if (this.currentTask?.id === taskId) {
//             this.currentTask = null
//           }
//         }
//         await this.updateStatistics()
//       } catch (error) {
//         console.error('删除任务失败:', error)
//         throw error
//       }
//     },
//
//     setCurrentTask(task) {
//       this.currentTask = task
//     },
//
//     async incrementTaskPomodoro(taskId) {
//       try {
//         const updatedTask = await taskApi.incrementTaskPomodoro(taskId)
//         const index = this.tasks.findIndex(t => t.id === taskId)
//         if (index !== -1) {
//           this.tasks[index] = updatedTask
//         }
//         await this.updateStatistics()
//       } catch (error) {
//         console.error('更新任务番茄数失败:', error)
//         throw error
//       }
//     },
//
//     async updateStatistics() {
//       try {
//         // 更新总番茄数
//         this.statistics.totalPomodoros = this.tasks.reduce(
//           (sum, task) => sum + task.completedPomodoros,
//           0
//         )
//
//         // 更新完成任务数
//         this.statistics.completedTasks = this.tasks.filter(
//           task => task.completedPomodoros >= task.estimatedPomodoros
//         ).length
//
//         // 更新总专注时间（分钟）
//         this.statistics.totalFocusTime = this.statistics.totalPomodoros * 25
//
//         // 保存统计数据
//         await statisticsApi.updateStatistics(this.statistics)
//
//         // 更新每日统计
//         await this.updateDailyStats()
//       } catch (error) {
//         console.error('更新统计数据失败:', error)
//         throw error
//       }
//     },
//
//     async updateDailyStats() {
//       try {
//         const today = new Date().toISOString().split('T')[0]
//         const dailyStats = await statisticsApi.getDailyStats()
//
//         const todayStats = dailyStats.find(stat => stat.date === today) || {
//           date: today,
//           pomodoros: 0,
//           completedTasks: 0
//         }
//
//         todayStats.pomodoros = this.tasks.reduce((sum, task) => {
//           if (task.updatedAt?.startsWith(today)) {
//             return sum + task.completedPomodoros
//           }
//           return sum
//         }, 0)
//
//         todayStats.completedTasks = this.tasks.filter(task =>
//           task.updatedAt?.startsWith(today) &&
//           task.completedPomodoros >= task.estimatedPomodoros
//         ).length
//
//         await statisticsApi.updateDailyStats(todayStats)
//         this.statistics.dailyStats = await statisticsApi.getDailyStats()
//       } catch (error) {
//         console.error('更新每日统计失败:', error)
//         throw error
//       }
//     },
//
//     async clearData() {
//       try {
//         this.tasks = []
//         this.currentTask = null
//         this.statistics = {
//           totalPomodoros: 0,
//           completedTasks: 0,
//           totalFocusTime: 0,
//           dailyStats: []
//         }
//         await statisticsApi.clearStatistics()
//         await taskApi.batchUpdateTasks([])
//       } catch (error) {
//         console.error('清除数据失败:', error)
//         throw error
//       }
//     }
//   }
// })