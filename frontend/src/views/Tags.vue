<template>
  <div class="tags-page">
    <div class="page-header">
      <h2>标签管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        新建标签
      </el-button>
    </div>

    <!-- 标签列表 -->
    <div class="tags-list" v-loading="tagStore.loading">
      <el-card v-for="tag in tagStore.getAllTags" :key="tag.id" class="tag-card">
        <div class="tag-card-content">
          <div class="tag-info">
            <div class="tag-header">
              <el-icon :style="{ color: tag.color }">
                <component :is="tag.icon" />
              </el-icon>
              <span class="tag-name">{{ tag.name }}</span>
            </div>
            <p class="tag-description">{{ tag.description }}</p>
            <div class="tag-stats">
              <span class="stat-item">
                <el-icon><Document /></el-icon>
                任务数: {{ tag.taskCount }}
              </span>
              <span class="stat-item">
                <el-icon><Check /></el-icon>
                已完成: {{ Math.floor(Math.random() * tag.taskCount) }}
              </span>
            </div>
          </div>
          <div class="tag-actions">
            <el-button-group>
              <el-button type="primary" link @click="openEditDialog(tag)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDeleteTag(tag)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </el-button-group>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 创建/编辑标签对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEditing ? '编辑标签' : '新建标签'"
      width="400px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="tagFormRef"
        :model="tagForm"
        :rules="tagRules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="tagForm.color" show-alpha />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="tagForm.icon" placeholder="请选择图标">
            <el-option
              v-for="icon in availableIcons"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
            >
              <div class="icon-option">
                <el-icon>
                  <component :is="icon.value" />
                </el-icon>
                <span>{{ icon.label }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="tagForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入标签描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTagStore } from '../store/tag'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Document,
  Check,
  Briefcase,
  Reading,
  House,
  Basketball,
  Film,
  Collection,
  Star,
  Location,
  Timer,
  Setting
} from '@element-plus/icons-vue'

const tagStore = useTagStore()
const showDialog = ref(false)
const isEditing = ref(false)
const tagFormRef = ref(null)

// 可用的图标列表
const availableIcons = [
  { label: '工作', value: 'Briefcase' },
  { label: '学习', value: 'Reading' },
  { label: '生活', value: 'House' },
  { label: '运动', value: 'Basketball' },
  { label: '娱乐', value: 'Film' },
  { label: '收藏', value: 'Star' },
  { label: '位置', value: 'Location' },
  { label: '计时', value: 'Timer' },
  { label: '设置', value: 'Setting' },
  { label: '分类', value: 'Collection' }
]

// 表单数据
const tagForm = ref({
  name: '',
  color: '#409EFF',
  icon: 'Briefcase',
  description: ''
})

// 表单验证规则
const tagRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  color: [
    { required: true, message: '请选择标签颜色', trigger: 'change' }
  ],
  icon: [
    { required: true, message: '请选择标签图标', trigger: 'change' }
  ],
  description: [
    { max: 100, message: '描述不能超过 100 个字符', trigger: 'blur' }
  ]
}

// 初始化数据
onMounted(async () => {
  try {
    await tagStore.initTags()
  } catch (error) {
    console.error('初始化标签数据失败:', error)
  }
})

// 打开创建对话框
function openCreateDialog() {
  isEditing.value = false
  tagForm.value = {
    name: '',
    color: '#409EFF',
    icon: 'Briefcase',
    description: ''
  }
  showDialog.value = true
}

// 打开编辑对话框
function openEditDialog(tag) {
  isEditing.value = true
  tagForm.value = { ...tag }
  showDialog.value = true
}

// 关闭对话框
function handleDialogClose() {
  showDialog.value = false
  tagFormRef.value?.resetFields()
}

// 提交表单
async function handleSubmit() {
  if (!tagFormRef.value) return
  
  try {
    await tagFormRef.value.validate()
    
    if (isEditing.value) {
      await tagStore.updateTag(tagForm.value.id, tagForm.value)
    } else {
      await tagStore.createTag(tagForm.value)
    }
    
    showDialog.value = false
    tagFormRef.value.resetFields()
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  }
}

// 删除标签
async function handleDeleteTag(tag) {
  try {
    await ElMessageBox.confirm(
      `确定要删除标签"${tag.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await tagStore.deleteTag(tag.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除标签失败:', error)
    }
  }
}
</script>

<style scoped>
.tags-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color, #303133);
}

.tags-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.tag-card {
  transition: all 0.3s ease;
}

.tag-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tag-card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tag-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tag-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-header .el-icon {
  font-size: 1.25rem;
}

.tag-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-color, #303133);
}

.tag-description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-color-secondary, #909399);
  line-height: 1.4;
}

.tag-stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: var(--text-color-secondary, #909399);
}

.tag-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-option .el-icon {
  font-size: 1.1rem;
}

/* 深色模式样式 */
:deep(.dark-mode) .tag-card {
  background: var(--card-bg, #2c2c2c);
  border-color: var(--border-color, #404040);
}

:deep(.dark-mode) .tag-name {
  color: #ffffff;
}

:deep(.dark-mode) .tag-description {
  color: var(--text-color-secondary, #909399);
}

:deep(.dark-mode) .stat-item {
  color: var(--text-color-secondary, #909399);
}

@media (max-width: 768px) {
  .tags-page {
    padding: 1rem;
  }

  .tags-list {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .page-header h2 {
    font-size: 1.25rem;
  }
}
</style> 