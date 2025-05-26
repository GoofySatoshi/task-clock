import { defineStore } from 'pinia'
import { tagApi } from '../mock/tags'
import { ElMessage } from 'element-plus'

export const useTagStore = defineStore('tag', {
  state: () => ({
    tags: [],
    loading: false,
    error: null
  }),

  getters: {
    // 获取所有标签
    getAllTags: (state) => state.tags,

    // 根据 ID 获取标签
    getTagById: (state) => (id) => state.tags.find(tag => tag.id === id),

    // 获取标签统计信息
    getTagStats: (state) => state.tags.map(tag => ({
      ...tag,
      completedTaskCount: Math.floor(Math.random() * tag.taskCount) // 模拟已完成任务数
    }))
  },

  actions: {
    // 初始化标签数据
    async initTags() {
      this.loading = true
      this.error = null
      try {
        const tags = await tagApi.getTags()
        this.tags = tags
      } catch (error) {
        console.error('获取标签失败:', error)
        this.error = error.message
        ElMessage.error('获取标签失败')
      } finally {
        this.loading = false
      }
    },

    // 创建新标签
    async createTag(tagData) {
      this.loading = true
      this.error = null
      try {
        const newTag = await tagApi.createTag(tagData)
        this.tags.push(newTag)
        ElMessage.success('创建标签成功')
        return newTag
      } catch (error) {
        console.error('创建标签失败:', error)
        this.error = error.message
        ElMessage.error('创建标签失败')
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新标签
    async updateTag(id, updates) {
      this.loading = true
      this.error = null
      try {
        const updatedTag = await tagApi.updateTag(id, updates)
        const index = this.tags.findIndex(tag => tag.id === id)
        if (index !== -1) {
          this.tags[index] = updatedTag
        }
        ElMessage.success('更新标签成功')
        return updatedTag
      } catch (error) {
        console.error('更新标签失败:', error)
        this.error = error.message
        ElMessage.error('更新标签失败')
        throw error
      } finally {
        this.loading = false
      }
    },

    // 删除标签
    async deleteTag(id) {
      this.loading = true
      this.error = null
      try {
        await tagApi.deleteTag(id)
        this.tags = this.tags.filter(tag => tag.id !== id)
        ElMessage.success('删除标签成功')
      } catch (error) {
        console.error('删除标签失败:', error)
        this.error = error.message
        ElMessage.error('删除标签失败')
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取标签统计
    async fetchTagStats() {
      this.loading = true
      this.error = null
      try {
        const stats = await tagApi.getTagStats()
        return stats
      } catch (error) {
        console.error('获取标签统计失败:', error)
        this.error = error.message
        ElMessage.error('获取标签统计失败')
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 