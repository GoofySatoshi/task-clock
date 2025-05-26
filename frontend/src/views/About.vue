<template>
  <div class="about-container">
    <div class="about-header">
      <h1>关于我们</h1>
    </div>

    <div class="about-content">
      <el-card class="about-card">
        <template #header>
          <div class="card-header">
            <h2>番茄时钟</h2>
            <span class="version">版本 1.0.0</span>
          </div>
        </template>
        
        <div class="card-content">
          <p class="description">
            番茄时钟是一个帮助您提高工作效率的时间管理工具。通过番茄工作法，
            您可以更好地管理时间，提高专注力，实现工作与休息的平衡。
          </p>

          <div class="features">
            <h3>主要功能</h3>
            <ul>
              <li>
                <el-icon><Timer /></el-icon>
                <span>标准25分钟工作计时</span>
              </li>
              <li>
                <el-icon><List /></el-icon>
                <span>任务管理与分类</span>
              </li>
              <li>
                <el-icon><DataLine /></el-icon>
                <span>数据统计与分析</span>
              </li>
              <li>
                <el-icon><Setting /></el-icon>
                <span>个性化设置</span>
              </li>
            </ul>
          </div>

          <div class="contact">
            <h3>联系我们</h3>
            <p>
              如果您有任何问题或建议，欢迎通过以下方式联系我们：
            </p>
            <ul>
              <li>
                <el-icon><Message /></el-icon>
                <span>邮箱：support@taskclock.com</span>
              </li>
              <li>
                <el-icon><ChatDotRound /></el-icon>
                <span>GitHub：github.com/taskclock</span>
              </li>
            </ul>
          </div>

          <div class="copyright">
            <p>© 2024 番茄时钟. All rights reserved.</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import {
  Timer,
  List,
  DataLine,
  Setting,
  Message,
  ChatDotRound
} from '@element-plus/icons-vue'
</script>

<style scoped>
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.about-header {
  margin-bottom: 24px;
}

.about-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.about-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.version {
  font-size: 14px;
  color: var(--text-color-secondary);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-color);
}

.features h3,
.contact h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.features ul,
.contact ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.features li,
.contact li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

.features .el-icon,
.contact .el-icon {
  font-size: 20px;
  color: var(--primary-color);
}

.contact p {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.copyright {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--text-color-secondary);
}

@media (max-width: 768px) {
  .about-container {
    padding: 16px;
  }

  .features li,
  .contact li {
    font-size: 14px;
  }

  .description {
    font-size: 14px;
  }
}
</style> 