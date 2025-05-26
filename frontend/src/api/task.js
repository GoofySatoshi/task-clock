// 任务相关的API函数

/**
 * 获取所有任务
 * @returns {Promise<Array>} 任务列表
 */
export async function getTasks() {
  try {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    return tasks
  } catch (error) {
    console.error('获取任务失败:', error)
    throw error
  }
}

/**
 * 添加新任务
 * @param {Object} task 任务对象
 * @param {string} task.title 任务标题
 * @param {number} task.estimatedPomodoros 预计番茄数
 * @param {Array<string>} task.tags 标签列表
 * @returns {Promise<Object>} 新创建的任务
 */
export async function addTask(task) {
  try {
    const tasks = await getTasks()
    const newTask = {
      ...task,
      id: Date.now().toString(),
      completedPomodoros: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    tasks.push(newTask)
    localStorage.setItem('tasks', JSON.stringify(tasks))
    return newTask
  } catch (error) {
    console.error('添加任务失败:', error)
    throw error
  }
}

/**
 * 更新任务
 * @param {Object} task 任务对象
 * @param {string} task.id 任务ID
 * @returns {Promise<Object>} 更新后的任务
 */
export async function updateTask(task) {
  try {
    const tasks = await getTasks()
    const index = tasks.findIndex(t => t.id === task.id)
    if (index === -1) {
      throw new Error('任务不存在')
    }
    
    const updatedTask = {
      ...tasks[index],
      ...task,
      updatedAt: new Date().toISOString()
    }
    tasks[index] = updatedTask
    localStorage.setItem('tasks', JSON.stringify(tasks))
    return updatedTask
  } catch (error) {
    console.error('更新任务失败:', error)
    throw error
  }
}

/**
 * 删除任务
 * @param {string} taskId 任务ID
 * @returns {Promise<void>}
 */
export async function deleteTask(taskId) {
  try {
    const tasks = await getTasks()
    const index = tasks.findIndex(t => t.id === taskId)
    if (index === -1) {
      throw new Error('任务不存在')
    }
    
    tasks.splice(index, 1)
    localStorage.setItem('tasks', JSON.stringify(tasks))
  } catch (error) {
    console.error('删除任务失败:', error)
    throw error
  }
}

/**
 * 增加任务的完成番茄数
 * @param {string} taskId 任务ID
 * @returns {Promise<Object>} 更新后的任务
 */
export async function incrementTaskPomodoro(taskId) {
  try {
    const tasks = await getTasks()
    const task = tasks.find(t => t.id === taskId)
    if (!task) {
      throw new Error('任务不存在')
    }
    
    task.completedPomodoros++
    task.updatedAt = new Date().toISOString()
    localStorage.setItem('tasks', JSON.stringify(tasks))
    return task
  } catch (error) {
    console.error('更新任务番茄数失败:', error)
    throw error
  }
}

/**
 * 批量更新任务
 * @param {Array<Object>} tasks 任务列表
 * @returns {Promise<void>}
 */
export async function batchUpdateTasks(tasks) {
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  } catch (error) {
    console.error('批量更新任务失败:', error)
    throw error
  }
} 