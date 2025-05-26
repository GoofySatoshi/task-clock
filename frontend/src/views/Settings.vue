<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1>设置</h1>
    </div>

    <el-skeleton :loading="loading" animated :count="4" v-if="loading">
      <template #template>
        <div class="settings-section skeleton">
          <div class="section-header"></div>
          <div class="section-content"></div>
        </div>
      </template>
    </el-skeleton>

    <template v-else>
      <!-- 时间设置 -->
      <div class="settings-section">
        <h2>时间设置</h2>
        <div class="settings-grid">
          <div class="setting-item">
            <label>工作时长（分钟）</label>
            <el-input-number
              v-model="settingsStore.settings.workDuration"
              :min="1"
              :max="60"
              @change="value => handleUpdateSettings({ workDuration: value })"
              class="custom-input-number"
            />
          </div>

          <div class="setting-item">
            <label>短休息时长（分钟）</label>
            <el-input-number
              v-model="settingsStore.settings.shortBreakDuration"
              :min="1"
              :max="30"
              @change="value => handleUpdateSettings({ shortBreakDuration: value })"
              class="custom-input-number"
            />
          </div>

          <div class="setting-item">
            <label>长休息时长（分钟）</label>
            <el-input-number
              v-model="settingsStore.settings.longBreakDuration"
              :min="1"
              :max="60"
              @change="value => handleUpdateSettings({ longBreakDuration: value })"
              class="custom-input-number"
            />
          </div>

          <div class="setting-item">
            <label>长休息间隔（番茄数）</label>
            <el-input-number
              v-model="settingsStore.settings.longBreakInterval"
              :min="1"
              :max="10"
              @change="value => handleUpdateSettings({ longBreakInterval: value })"
              class="custom-input-number"
            />
          </div>
        </div>
      </div>

      <!-- 通知设置 -->
      <div class="settings-section">
        <h2>通知设置</h2>
        <div class="settings-grid">
          <div class="setting-item">
            <label>声音提醒</label>
            <el-switch
              v-model="settingsStore.settings.soundEnabled"
              @change="value => handleUpdateSettings({ soundEnabled: value })"
            />
          </div>

          <div class="setting-item">
            <label>系统通知</label>
            <el-switch
              v-model="settingsStore.settings.notificationEnabled"
              @change="value => handleUpdateSettings({ notificationEnabled: value })"
            />
          </div>

          <div class="setting-item">
            <label>自动开始休息</label>
            <el-switch
              v-model="settingsStore.settings.autoStartBreaks"
              @change="value => handleUpdateSettings({ autoStartBreaks: value })"
            />
          </div>

          <div class="setting-item">
            <label>自动开始工作</label>
            <el-switch
              v-model="settingsStore.settings.autoStartPomodoros"
              @change="value => handleUpdateSettings({ autoStartPomodoros: value })"
            />
          </div>

          <div class="setting-item">
            <label>跳过休息时间</label>
            <el-switch
              v-model="settingsStore.settings.skipBreaks"
              @change="value => handleUpdateSettings({ skipBreaks: value })"
            />
            <span class="setting-description">开启后，工作结束后将直接进入下一个工作周期，跳过休息时间</span>
          </div>
        </div>
      </div>

      <!-- 主题设置 -->
      <div class="settings-section">
        <h2>主题设置</h2>
        <div class="settings-grid">
          <div class="setting-item">
            <label>主题颜色</label>
            <el-color-picker
              v-model="settingsStore.settings.themeColor"
              @change="value => handleUpdateSettings({ themeColor: value })"
            />
          </div>

          <div class="setting-item">
            <label>深色模式</label>
            <el-switch
              v-model="settingsStore.settings.darkMode"
              @change="value => handleUpdateSettings({ darkMode: value })"
            />
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="settings-section">
        <h2>数据管理</h2>
        <div class="settings-actions">
          <el-button @click="handleResetSettings">重置设置</el-button>
          <el-button type="primary" @click="handleExportData">导出数据</el-button>
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept=".json"
            @change="handleImportData"
          >
            <el-button type="success">导入数据</el-button>
          </el-upload>
          <el-button type="danger" @click="handleClearData">清除数据</el-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useSettingsStore } from '../store/settings'
import { settingsApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const settingsStore = useSettingsStore()
const loading = ref(false)

// 获取设置
const fetchSettings = async () => {
  try {
    loading.value = true
    await settingsStore.initSettings()
  } catch (error) {
    ElMessage.error('获取设置失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 监听主题颜色的变化
watch(
  () => settingsStore.settings?.themeColor,
  (newColor) => {
    if (newColor) {
      document.documentElement.style.setProperty('--primary-color', newColor)
    }
  }
)

// 更新设置
const handleUpdateSettings = async (updates) => {
  try {
    loading.value = true
    
    // 检查是否只更新了不需要触发主题切换的设置
    const noThemeUpdateKeys = [
      'workDuration',
      'shortBreakDuration',
      'longBreakDuration',
      'longBreakInterval',
      'soundEnabled',
      'notificationEnabled',
      'autoStartBreaks',
      'autoStartPomodoros',
      'skipBreaks'
    ]
    
    const isNoThemeUpdate = Object.keys(updates).every(key => 
      noThemeUpdateKeys.includes(key)
    )
    
    if (isNoThemeUpdate) {
      // 如果是不需要触发主题切换的设置，使用 updateSettingsWithoutTheme
      await settingsStore.updateSettingsWithoutTheme({
        ...settingsStore.settings,
        ...updates
      })
    } else {
      // 如果是主题相关的设置（themeColor 或 darkMode），使用 updateSettings
      await settingsStore.updateSettings(updates)
    }
    
    ElMessage.success('设置已更新')
  } catch (error) {
    ElMessage.error('更新设置失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 重置设置
const handleResetSettings = async () => {
  try {
    await ElMessageBox.confirm('确定要重置所有设置吗？', '提示', {
      type: 'warning'
    })
    loading.value = true
    await settingsStore.resetSettings()
    ElMessage.success('设置已重置')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置设置失败：' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 导出数据
const handleExportData = async () => {
  try {
    loading.value = true
    const data = await settingsStore.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pomodoro-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('导出数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 导入数据
const handleImportData = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    loading.value = true
    const text = await file.text()
    const data = JSON.parse(text)
    await settingsStore.importData(data)
    ElMessage.success('数据导入成功')
  } catch (error) {
    ElMessage.error('导入数据失败：' + error.message)
  } finally {
    loading.value = false
    // 清空文件输入，允许重复导入同一文件
    event.target.value = ''
  }
}

// 清除数据
const handleClearData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有数据吗？此操作不可恢复！',
      '警告',
      {
        type: 'warning',
        confirmButtonText: '确定清除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger'
      }
    )
    loading.value = true
    await settingsStore.clearData()
    ElMessage.success('数据已清除')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清除数据失败：' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取设置
onMounted(fetchSettings)
</script>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 20px;
}

.settings-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.settings-section h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item label {
  color: #666;
  font-size: 14px;
}

.settings-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.skeleton {
  height: 200px;
  background: #f5f7fa;
  border-radius: 8px;
}

.skeleton .section-header {
  height: 24px;
  background: #e4e7ed;
  border-radius: 4px;
  margin-bottom: 20px;
  width: 200px;
}

.skeleton .section-content {
  height: 150px;
  background: #e4e7ed;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .settings-container {
    padding: 10px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .settings-actions {
    flex-direction: column;
  }

  .settings-actions .el-button {
    width: 100%;
  }
}

/* 深色模式样式 */
:deep(.dark-mode) .settings-section {
  background: var(--card-bg, #1a1a1a);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
}

:deep(.dark-mode) .settings-section h2 {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

:deep(.dark-mode) .setting-item label {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

:deep(.dark-mode) .el-input-number__input,
:deep(.dark-mode) .el-input-number__decrease,
:deep(.dark-mode) .el-input-number__increase,
:deep(.dark-mode) .el-input__inner,
:deep(.dark-mode) .el-input__inner::placeholder,
:deep(.dark-mode) .el-select__input,
:deep(.dark-mode) .el-select__placeholder,
:deep(.dark-mode) .el-dialog__title,
:deep(.dark-mode) .el-dialog__body,
:deep(.dark-mode) .el-form-item__label,
:deep(.dark-mode) .el-button:not(.is-disabled),
:deep(.dark-mode) .el-button--text,
:deep(.dark-mode) .el-switch__label,
:deep(.dark-mode) .el-switch__label.is-active,
:deep(.dark-mode) .el-color-picker__trigger-text {
  color: #000000 !important;
  -webkit-text-fill-color: #000000 !important;
}

:deep(.dark-mode) .el-input-number__input,
:deep(.dark-mode) .el-input__inner {
  background-color: var(--bg-color, #2c2c2c);
  border-color: var(--border-color, #404040);
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

:deep(.dark-mode) .el-switch__core {
  border-color: var(--border-color, #404040);
  background-color: var(--bg-color, #2c2c2c);
}

:deep(.dark-mode) .el-switch.is-checked .el-switch__core {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.dark-mode) .el-dialog {
  background-color: var(--card-bg, #1a1a1a);
}

:deep(.dark-mode) .el-select-dropdown {
  background-color: var(--card-bg, #1a1a1a);
  border-color: var(--border-color, #404040);
}

:deep(.dark-mode) .el-select-dropdown__item {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

:deep(.dark-mode) .el-select-dropdown__item.selected {
  background-color: var(--active-color, rgba(64, 158, 255, 0.1));
}

:deep(.dark-mode) .el-select-dropdown__item.hover,
:deep(.dark-mode) .el-select-dropdown__item:hover {
  background-color: var(--bg-color, #2c2c2c);
}

/* 自定义数字输入框样式 */
.custom-input-number {
  --custom-input-color: #ffffff;
}

:deep(.dark-mode) .custom-input-number .el-input-number__input,
:deep(.dark-mode) .custom-input-number .el-input-number__decrease,
:deep(.dark-mode) .custom-input-number .el-input-number__increase,
:deep(.dark-mode) .custom-input-number .el-input__inner,
:deep(.dark-mode) .custom-input-number .el-input-number__decrease:hover,
:deep(.dark-mode) .custom-input-number .el-input-number__increase:hover,
:deep(.dark-mode) .custom-input-number .el-input-number__decrease.is-disabled,
:deep(.dark-mode) .custom-input-number .el-input-number__increase.is-disabled,
:deep(.dark-mode) .custom-input-number .el-input-number__decrease.is-disabled:hover,
:deep(.dark-mode) .custom-input-number .el-input-number__increase.is-disabled:hover {
  color: var(--custom-input-color) !important;
  -webkit-text-fill-color: var(--custom-input-color) !important;
}

:deep(.dark-mode) .custom-input-number .el-input-number__decrease,
:deep(.dark-mode) .dark-mode .custom-input-number .el-input-number__increase {
  background-color: var(--bg-color, #2c2c2c) !important;
  border-color: var(--border-color, #404040) !important;
}

:deep(.dark-mode) .custom-input-number .el-input-number__decrease:hover,
:deep(.dark-mode) .custom-input-number .el-input-number__increase:hover {
  background-color: var(--bg-color, #2c2c2c) !important;
  border-color: var(--border-color, #404040) !important;
  color: var(--custom-input-color) !important;
  -webkit-text-fill-color: var(--custom-input-color) !important;
}

:deep(.dark-mode) .custom-input-number .el-input-number__decrease.is-disabled,
:deep(.dark-mode) .custom-input-number .el-input-number__increase.is-disabled {
  background-color: var(--bg-color, #2c2c2c) !important;
  border-color: var(--border-color, #404040) !important;
  opacity: 0.5;
}

:deep(.dark-mode) .custom-input-number .el-input-number__input {
  background-color: var(--bg-color, #2c2c2c) !important;
  border-color: var(--border-color, #404040) !important;
}

:deep(.dark-mode) .custom-input-number .el-input-number__input:hover,
:deep(.dark-mode) .custom-input-number .el-input-number__input:focus {
  border-color: var(--primary-color) !important;
}

.setting-description {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-top: 4px;
}

:deep(.dark-mode) .setting-description {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  opacity: 0.7;
}
</style> 