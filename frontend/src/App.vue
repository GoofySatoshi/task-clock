<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from './store/settings'
import {
  Timer,
  List,
  DataLine,
  Setting,
  ArrowRight,
  ArrowLeft,
  Collection,
  InfoFilled,
  Moon,
  Sunny
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const isMobile = ref(window.innerWidth <= 768)
const isCollapsed = ref(false)

// 监听深色模式变化
watch(
  () => settingsStore.settings?.darkMode,
  (newValue) => {
    if (newValue !== undefined) {
      settingsStore.applySettings()
    }
  }
)

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    if (isMobile.value) {
      isCollapsed.value = true
    }
  }
)

// 处理菜单点击
const handleMenuSelect = (index) => {
  router.push(index)
}

// 计算属性：未完成任务数量
const incompleteTasksCount = computed(() => {
})

// 计算属性：今日完成的番茄钟数量
const todayPomodorosCount = computed(() => {

})

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isCollapsed.value = false
  }
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  settingsStore.initSettings()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="app" :class="{ 'is-collapsed': isCollapsed }">
    <!-- 侧边导航栏 -->
    <el-aside v-if="!isMobile" class="nav-sidebar" :width="isCollapsed ? '80px' : '240px'">
      <div class="nav-header">
        <div class="nav-logo">
          <img src="./assets/logo.svg" alt="Logo" />
          <h1 v-show="!isCollapsed">番茄时钟</h1>
        </div>
        <el-button
          v-show="!isMobile"
          class="collapse-btn"
          :icon="isCollapsed ? ArrowRight : ArrowLeft"
          circle
          text
          @click="toggleCollapse"
        />
      </div>

      <el-menu
        :collapse="isCollapsed"
        :default-active="route.path"
        router
        class="nav-menu"
        :unique-opened="true"
        :collapse-transition="false"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/tasks" :title="isCollapsed ? '任务列表' : ''">
          <el-icon><List /></el-icon>
          <template #title>
            任务列表
            <el-badge
              v-if="incompleteTasksCount > 0"
              :value="incompleteTasksCount"
              class="nav-badge"
            />
          </template>
        </el-menu-item>

        <el-menu-item index="/timer" :title="isCollapsed ? '番茄时钟' : ''">
          <el-icon><Timer /></el-icon>
          <template #title>番茄时钟</template>
        </el-menu-item>

        <el-menu-item index="/tags" :title="isCollapsed ? '标签管理' : ''">
          <el-icon><Collection /></el-icon>
          <template #title>标签管理</template>
        </el-menu-item>

        <el-menu-item index="/statistics" :title="isCollapsed ? '统计信息' : ''">
          <el-icon><DataLine /></el-icon>
          <template #title>
            统计信息
            <el-badge
              v-if="todayPomodorosCount > 0"
              :value="todayPomodorosCount"
              class="nav-badge"
              type="success"
            />
          </template>
        </el-menu-item>

        <el-menu-item index="/settings" :title="isCollapsed ? '系统设置' : ''">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>

        <el-menu-item index="/about" :title="isCollapsed ? '关于我们' : ''">
          <el-icon><InfoFilled /></el-icon>
          <template #title>关于我们</template>
        </el-menu-item>
      </el-menu>

      <div class="nav-footer" v-show="!isCollapsed">
        <el-tooltip
          :content="settingsStore.settings?.darkMode ? '切换到浅色模式' : '切换到深色模式'"
          placement="right"
        >
          <el-switch
            v-model="settingsStore.settings.darkMode"
            inline-prompt
            :active-icon="Moon"
            :inactive-icon="Sunny"
            @change="(val) => settingsStore.updateSettings({ darkMode: val })"
          />
        </el-tooltip>
      </div>
    </el-aside>

    <!-- 底部导航栏（移动端） -->
    <nav v-else class="nav-bottom">
      <router-link to="/tasks" class="nav-item" custom v-slot="{ isActive, navigate }">
        <el-tooltip content="任务列表" placement="top">
          <div 
            class="nav-item-content" 
            :class="{ active: isActive }" 
            @click="() => { navigate(); handleMenuSelect('/tasks') }"
          >
            <el-icon><List /></el-icon>
            <span>任务</span>
            <el-badge
              v-if="incompleteTasksCount > 0"
              :value="incompleteTasksCount"
              class="nav-badge"
            />
          </div>
        </el-tooltip>
      </router-link>

      <router-link to="/timer" class="nav-item" custom v-slot="{ isActive, navigate }">
        <el-tooltip content="番茄时钟" placement="top">
          <div 
            class="nav-item-content" 
            :class="{ active: isActive }" 
            @click="() => { navigate(); handleMenuSelect('/timer') }"
          >
            <el-icon><Timer /></el-icon>
            <span>时钟</span>
          </div>
        </el-tooltip>
      </router-link>

      <router-link to="/tags" class="nav-item" custom v-slot="{ isActive, navigate }">
        <el-tooltip content="标签管理" placement="top">
          <div 
            class="nav-item-content" 
            :class="{ active: isActive }" 
            @click="() => { navigate(); handleMenuSelect('/tags') }"
          >
            <el-icon><Collection /></el-icon>
            <span>标签</span>
          </div>
        </el-tooltip>
      </router-link>

      <router-link to="/statistics" class="nav-item" custom v-slot="{ isActive, navigate }">
        <el-tooltip content="统计信息" placement="top">
          <div 
            class="nav-item-content" 
            :class="{ active: isActive }" 
            @click="() => { navigate(); handleMenuSelect('/statistics') }"
          >
            <el-icon><DataLine /></el-icon>
            <span>统计</span>
            <el-badge
              v-if="todayPomodorosCount > 0"
              :value="todayPomodorosCount"
              class="nav-badge"
              type="success"
            />
          </div>
        </el-tooltip>
      </router-link>

      <router-link to="/settings" class="nav-item" custom v-slot="{ isActive, navigate }">
        <el-tooltip content="系统设置" placement="top">
          <div 
            class="nav-item-content" 
            :class="{ active: isActive }" 
            @click="() => { navigate(); handleMenuSelect('/settings') }"
          >
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </div>
        </el-tooltip>
      </router-link>

      <router-link to="/about" class="nav-item" custom v-slot="{ isActive, navigate }">
        <el-tooltip content="关于我们" placement="top">
          <div 
            class="nav-item-content" 
            :class="{ active: isActive }" 
            @click="() => { navigate(); handleMenuSelect('/about') }"
          >
            <el-icon><InfoFilled /></el-icon>
            <span>关于我们</span>
          </div>
        </el-tooltip>
      </router-link>
    </nav>

    <main class="main-content" :class="{ 'is-collapsed': isCollapsed }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
/* 基础样式 */
.app {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
  position: relative;
}

/* 导航栏样式 */
.nav-sidebar {
  background-color: var(--nav-bg);
  border-right: 1px solid var(--border-color);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  overflow-x: hidden;
  overflow-y: auto;
}

.nav-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--nav-bg);
  position: sticky;
  top: 0;
  z-index: 1;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-logo img {
  width: 32px;
  height: 32px;
}

.nav-logo h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  color: var(--text-color);
}

.collapse-btn {
  padding: 4px;
  font-size: 16px;
  transition: all 0.3s ease;
  border: none !important;
  background: transparent !important;
  color: var(--text-color) !important;
}

.collapse-btn:hover {
  transform: scale(1.1);
  color: var(--primary-color) !important;
  background: var(--hover-color) !important;
}

.nav-menu {
  flex: 1;
  border-right: none;
  background-color: transparent;
  overflow-x: hidden;
}

.nav-menu .el-menu-item {
  height: 56px;
  line-height: 56px;
  margin: 4px 0;
  border-radius: 4px;
  margin-left: 8px;
  margin-right: 8px;
  width: calc(100% - 16px);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.nav-menu .el-menu-item .el-icon {
  font-size: 20px;
  margin-right: 4px;
}

.nav-menu:not(.el-menu--collapse) .el-menu-item {
  padding-left: 20px !important;
}

.nav-menu.el-menu--collapse .el-menu-item {
  padding: 0 !important;
  justify-content: center;
  width: 64px !important;
  margin: 4px auto !important;
}

.nav-menu .el-menu-item.is-active {
  background-color: var(--active-color);
  color: var(--primary-color);
  font-weight: 500;
}

.nav-menu .el-menu-item:hover {
  background-color: var(--hover-color);
}

.nav-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
  background-color: var(--nav-bg);
  position: sticky;
  bottom: 0;
  z-index: 1;
}

/* 移动端导航栏 */
.nav-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--nav-bg);
  display: flex;
  justify-content: space-around;
  padding: 8px;
  border-top: 1px solid var(--border-color);
  z-index: 1000;
}

.nav-item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  color: var(--text-color);
}

.nav-item-content:hover {
  background-color: var(--hover-color);
}

.nav-item-content.active {
  color: var(--primary-color);
}

.nav-item-content .el-icon {
  font-size: 20px;
}

.nav-item-content span {
  font-size: 12px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  margin-left: 240px;
  padding: 20px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  width: calc(100% - 240px);
  background-color: var(--bg-color);
  color: var(--text-color);
}

.app.is-collapsed .main-content {
  margin-left: 80px;
  width: calc(100% - 80px);
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .nav-sidebar {
    display: none;
  }

  .main-content {
    margin-left: 0;
    width: 100%;
    padding-bottom: 80px;
  }

  .nav-item-content {
    padding: 4px 8px;
  }
}

/* 滚动条样式 */
.nav-sidebar::-webkit-scrollbar {
  width: 4px;
}

.nav-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.nav-sidebar::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.nav-sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--text-color);
}

/* 导航项激活状态 */
.nav-item-content.active,
.el-menu-item.is-active {
  color: var(--primary-color) !important;
  background-color: var(--active-color) !important;
}

/* 移动端导航项样式 */
.nav-bottom .nav-item-content {
  position: relative;
}

.nav-bottom .nav-item-content.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 2px;
}
</style>