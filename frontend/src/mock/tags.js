// 标签数据
const tags = [
  {
    id: 1,
    name: '工作',
    color: '#409EFF',
    icon: 'Briefcase',
    description: '工作相关的任务',
    createdAt: '2024-03-15T08:00:00Z',
    taskCount: 5
  },
  {
    id: 2,
    name: '学习',
    color: '#67C23A',
    icon: 'Reading',
    description: '学习相关的任务',
    createdAt: '2024-03-15T08:00:00Z',
    taskCount: 3
  },
  {
    id: 3,
    name: '生活',
    color: '#E6A23C',
    icon: 'House',
    description: '日常生活相关的任务',
    createdAt: '2024-03-15T08:00:00Z',
    taskCount: 2
  },
  {
    id: 4,
    name: '运动',
    color: '#F56C6C',
    icon: 'Basketball',
    description: '运动健身相关的任务',
    createdAt: '2024-03-15T08:00:00Z',
    taskCount: 1
  },
  {
    id: 5,
    name: '娱乐',
    color: '#909399',
    icon: 'Film',
    description: '娱乐休闲相关的任务',
    createdAt: '2024-03-15T08:00:00Z',
    taskCount: 2
  }
]

// 模拟 API 延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 标签相关的 API 模拟
export const tagApi = {
  // 获取所有标签
  async getTags() {
    await delay(300)
    return [...tags]
  },

  // 创建新标签
  async createTag(tagData) {
    await delay(300)
    const newTag = {
      id: tags.length + 1,
      ...tagData,
      createdAt: new Date().toISOString(),
      taskCount: 0
    }
    tags.push(newTag)
    return newTag
  },

  // 更新标签
  async updateTag(id, updates) {
    await delay(300)
    const index = tags.findIndex(tag => tag.id === id)
    if (index === -1) {
      throw new Error('标签不存在')
    }
    tags[index] = { ...tags[index], ...updates }
    return tags[index]
  },

  // 删除标签
  async deleteTag(id) {
    await delay(300)
    const index = tags.findIndex(tag => tag.id === id)
    if (index === -1) {
      throw new Error('标签不存在')
    }
    const deletedTag = tags[index]
    tags.splice(index, 1)
    return deletedTag
  },

  // 获取标签使用统计
  async getTagStats() {
    await delay(300)
    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      taskCount: tag.taskCount,
      completedTaskCount: Math.floor(Math.random() * tag.taskCount) // 模拟已完成任务数
    }))
  }
}

// 导出标签数据供其他模块使用
export default tags 