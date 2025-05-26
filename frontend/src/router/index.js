import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import Tags from '../views/Tags.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { 
      title: '首页',
      keepAlive: true
    }
  },
  {
    path: '/timer',
    name: 'Timer',
    component: () => import('../views/Timer.vue'),
    meta: { 
      title: '番茄时钟',
      keepAlive: true
    }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/Tasks.vue'),
    meta: { 
      title: '任务列表',
      keepAlive: true
    }
  },
  {
    path: '/tags',
    name: 'Tags',
    component: Tags,
    meta: {
      title: '标签管理',
      icon: 'Collection'
    }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue'),
    meta: { 
      title: '统计信息',
      keepAlive: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { 
      title: '系统设置',
      keepAlive: true
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { 
      title: '关于我们',
      keepAlive: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
    meta: { 
      title: '页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { 
        top: 0,
        behavior: 'smooth'
      }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 番茄时钟` : '番茄时钟'
  
  // 处理路由错误
  if (to.matched.length === 0) {
    ElMessage.error('页面不存在')
    next('/')
    return
  }

  // 继续导航
  next()
})

// 全局后置守卫
router.afterEach((to, from) => {
  // 确保页面滚动到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
})

// 全局错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  ElMessage.error('页面加载失败，请刷新重试')
})

export default router 