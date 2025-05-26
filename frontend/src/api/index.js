// 导入 mock 服务
import { mockService } from '../mock/mockService'

// 导出 mock API 服务
export const taskApi = mockService.tasks
export const statisticsApi = mockService.statistics
export const settingsApi = mockService.settings
export const categoryApi = mockService.categories
export const priorityApi = mockService.priorities
export const soundsApi = mockService.sounds

// 导出所有 API 服务
export const api = {
  tasks: taskApi,
  statistics: statisticsApi,
  settings: settingsApi,
  categories: categoryApi,
  priorities: priorityApi,
  sounds: soundsApi
} 