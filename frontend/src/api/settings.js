// 设置相关的API函数

const defaultSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  notificationEnabled: true,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  themeColor: '#ff6347',
  darkMode: false
}

/**
 * 获取应用设置
 * @returns {Promise<Object>} 应用设置
 */
export async function getSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('settings'))
    return settings ? { ...defaultSettings, ...settings } : defaultSettings
  } catch (error) {
    console.error('获取设置失败:', error)
    throw error
  }
}

/**
 * 更新应用设置
 * @param {Object} settings 新的设置
 * @returns {Promise<Object>} 更新后的设置
 */
export async function updateSettings(settings) {
  try {
    const currentSettings = await getSettings()
    const newSettings = { ...currentSettings, ...settings }
    localStorage.setItem('settings', JSON.stringify(newSettings))
    return newSettings
  } catch (error) {
    console.error('更新设置失败:', error)
    throw error
  }
}

/**
 * 重置应用设置
 * @returns {Promise<Object>} 重置后的默认设置
 */
export async function resetSettings() {
  try {
    localStorage.setItem('settings', JSON.stringify(defaultSettings))
    return defaultSettings
  } catch (error) {
    console.error('重置设置失败:', error)
    throw error
  }
}

/**
 * 导出所有数据
 * @returns {Promise<Object>} 导出的数据
 */
export async function exportData() {
  try {
    const settings = await getSettings()
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const statistics = JSON.parse(localStorage.getItem('statistics') || '{}')
    const dailyStats = JSON.parse(localStorage.getItem('dailyStats') || '[]')
    
    return {
      settings,
      tasks,
      statistics,
      dailyStats,
      exportDate: new Date().toISOString()
    }
  } catch (error) {
    console.error('导出数据失败:', error)
    throw error
  }
}

/**
 * 导入数据
 * @param {Object} data 要导入的数据
 * @returns {Promise<void>}
 */
export async function importData(data) {
  try {
    if (data.settings) {
      localStorage.setItem('settings', JSON.stringify(data.settings))
    }
    if (data.tasks) {
      localStorage.setItem('tasks', JSON.stringify(data.tasks))
    }
    if (data.statistics) {
      localStorage.setItem('statistics', JSON.stringify(data.statistics))
    }
    if (data.dailyStats) {
      localStorage.setItem('dailyStats', JSON.stringify(data.dailyStats))
    }
  } catch (error) {
    console.error('导入数据失败:', error)
    throw error
  }
}

/**
 * 清除所有数据
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  try {
    localStorage.removeItem('settings')
    localStorage.removeItem('tasks')
    localStorage.removeItem('statistics')
    localStorage.removeItem('dailyStats')
  } catch (error) {
    console.error('清除数据失败:', error)
    throw error
  }
} 