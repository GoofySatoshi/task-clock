import { defineStore } from 'pinia'
import { settingsApi } from '../api'

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

// 主题相关的设置键
const themeRelatedKeys = ['themeColor', 'darkMode']

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: null
  }),

  actions: {
    async initSettings() {
      try {
        this.settings = await settingsApi.getSettings()
        this.applySettings() // 初始化时应用主题
      } catch (error) {
        console.error('加载设置失败:', error)
        throw error
      }
    },

    async updateSettings(newSettings) {
      try {
        // 检查是否有主题相关的设置变化
        const hasThemeChanges = Object.keys(newSettings).some(key => 
          themeRelatedKeys.includes(key) && 
          this.settings?.[key] !== newSettings[key]
        )

        // 更新设置
        this.settings = await settingsApi.updateSettings(newSettings)

        // 只在主题相关设置变化时应用主题
        if (hasThemeChanges) {
          this.applySettings()
        }
      } catch (error) {
        console.error('更新设置失败:', error)
        throw error
      }
    },

    // 直接更新设置而不触发主题应用
    async updateSettingsWithoutTheme(newSettings) {
      try {
        this.settings = await settingsApi.updateSettings(newSettings)
      } catch (error) {
        console.error('更新设置失败:', error)
        throw error
      }
    },

    applySettings() {
      if (!this.settings) return

      // 应用主题颜色
      document.documentElement.style.setProperty('--primary-color', this.settings.themeColor)

      // 应用深色模式
      if (this.settings.darkMode) {
        document.documentElement.classList.add('dark-mode')
        document.documentElement.style.setProperty('--bg-color', '#1a1a1a')
        document.documentElement.style.setProperty('--text-color', '#ffffff')
        document.documentElement.style.setProperty('--nav-bg', '#2d2d2d')
        document.documentElement.style.setProperty('--border-color', '#404040')
        document.documentElement.style.setProperty('--hover-color', '#404040')
        document.documentElement.style.setProperty('--active-color', '#404040')
      } else {
        document.documentElement.classList.remove('dark-mode')
        document.documentElement.style.setProperty('--bg-color', '#f5f5f5')
        document.documentElement.style.setProperty('--text-color', '#333333')
        document.documentElement.style.setProperty('--nav-bg', '#ffffff')
        document.documentElement.style.setProperty('--border-color', '#e0e0e0')
        document.documentElement.style.setProperty('--hover-color', '#f0f0f0')
        document.documentElement.style.setProperty('--active-color', '#fff0ed')
      }
    },

    async resetSettings() {
      try {
        this.settings = await settingsApi.resetSettings()
        this.applySettings()
      } catch (error) {
        console.error('重置设置失败:', error)
        throw error
      }
    },

    async exportData() {
      try {
        return await settingsApi.exportData()
      } catch (error) {
        console.error('导出数据失败:', error)
        throw error
      }
    },

    async importData(data) {
      try {
        await settingsApi.importData(data)
        await this.initSettings()
        this.applySettings()
      } catch (error) {
        console.error('导入数据失败:', error)
        throw error
      }
    },

    async clearData() {
      try {
        await settingsApi.clearAllData()
        await this.initSettings()
        this.applySettings()
      } catch (error) {
        console.error('清除数据失败:', error)
        throw error
      }
    }
  }
}) 