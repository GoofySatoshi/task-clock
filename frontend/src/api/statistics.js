// 统计相关的API函数

/**
 * 获取统计数据
 * @returns {Promise<Object>} 统计数据
 */
export async function getStatistics() {
  try {
    const statistics = JSON.parse(localStorage.getItem('statistics') || '{}')
    return {
      totalPomodoros: statistics.totalPomodoros || 0,
      completedTasks: statistics.completedTasks || 0,
      totalFocusTime: statistics.totalFocusTime || 0,
      dailyStats: statistics.dailyStats || []
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    throw error
  }
}

/**
 * 更新统计数据
 * @param {Object} statistics 统计数据
 * @returns {Promise<Object>} 更新后的统计数据
 */
export async function updateStatistics(statistics) {
  try {
    localStorage.setItem('statistics', JSON.stringify(statistics))
    return statistics
  } catch (error) {
    console.error('更新统计数据失败:', error)
    throw error
  }
}

/**
 * 获取每日统计数据
 * @returns {Promise<Array>} 每日统计数据列表
 */
export async function getDailyStats() {
  try {
    const dailyStats = JSON.parse(localStorage.getItem('dailyStats') || '[]')
    return dailyStats
  } catch (error) {
    console.error('获取每日统计数据失败:', error)
    throw error
  }
}

/**
 * 更新每日统计数据
 * @param {Object} dailyStat 每日统计数据
 * @returns {Promise<Array>} 更新后的每日统计数据列表
 */
export async function updateDailyStats(dailyStat) {
  try {
    const dailyStats = await getDailyStats()
    const index = dailyStats.findIndex(stat => stat.date === dailyStat.date)
    
    if (index !== -1) {
      dailyStats[index] = dailyStat
    } else {
      dailyStats.push(dailyStat)
    }
    
    localStorage.setItem('dailyStats', JSON.stringify(dailyStats))
    return dailyStats
  } catch (error) {
    console.error('更新每日统计数据失败:', error)
    throw error
  }
}

/**
 * 获取指定日期范围的统计数据
 * @param {string} startDate 开始日期 (YYYY-MM-DD)
 * @param {string} endDate 结束日期 (YYYY-MM-DD)
 * @returns {Promise<Array>} 日期范围内的统计数据
 */
export async function getDateRangeStats(startDate, endDate) {
  try {
    const dailyStats = await getDailyStats()
    return dailyStats.filter(stat => 
      stat.date >= startDate && stat.date <= endDate
    )
  } catch (error) {
    console.error('获取日期范围统计数据失败:', error)
    throw error
  }
}

/**
 * 获取任务分类统计
 * @returns {Promise<Array>} 任务分类统计数据
 */
export async function getTaskCategoryStats() {
  try {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const categoryStats = {}
    
    tasks.forEach(task => {
      task.tags.forEach(tag => {
        if (!categoryStats[tag]) {
          categoryStats[tag] = {
            name: tag,
            value: 0
          }
        }
        categoryStats[tag].value += task.completedPomodoros
      })
    })
    
    return Object.values(categoryStats)
  } catch (error) {
    console.error('获取任务分类统计失败:', error)
    throw error
  }
}

/**
 * 清除所有统计数据
 * @returns {Promise<void>}
 */
export async function clearStatistics() {
  try {
    localStorage.removeItem('statistics')
    localStorage.removeItem('dailyStats')
  } catch (error) {
    console.error('清除统计数据失败:', error)
    throw error
  }
} 