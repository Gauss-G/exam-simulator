<template>
  <div class="learn-container">
    <el-page-header v-if="!learnStarted" @back="$router.push('/')">
      <template #content>
        <span class="page-title">学习模式</span>
      </template>
    </el-page-header>

    <!-- 设置界面 -->
    <el-card v-if="!learnStarted" class="settings-card">
      <template #header>
        <div class="card-header">
          <span>学习设置</span>
        </div>
      </template>

      <el-form :model="learnForm" label-width="120px">
        <el-form-item label="题型选择">
          <el-select v-model="learnForm.type" placeholder="请选择题型">
            <el-option label="判断题" value="bool" />
            <el-option label="单选题" value="choose" />
            <el-option label="多选题" value="multi" />
            <el-option label="混合练习" value="mixed" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="learnForm.type === 'mixed'" label="各题型数量">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-input-number 
                v-model="learnForm.boolCount" 
                :min="0" 
                :max="50"
                placeholder="判断题"
              />
            </el-col>
            <el-col :span="8">
              <el-input-number 
                v-model="learnForm.chooseCount" 
                :min="0" 
                :max="50"
                placeholder="单选题"
              />
            </el-col>
            <el-col :span="8">
              <el-input-number 
                v-model="learnForm.multiCount" 
                :min="0" 
                :max="50"
                placeholder="多选题"
              />
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item v-else label="题目数量">
          <el-input-number 
            v-model="learnForm.count" 
            :min="1" 
            :max="50"
          />
        </el-form-item>

        <el-form-item label="排除已掌握">
          <el-switch v-model="learnForm.excludeMastered" />
          <span style="margin-left: 10px; color: #909399;">
            已掌握 {{ masteredCount }} 题
          </span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="startLearn">开始学习</el-button>
          <el-button @click="$router.push('/')">返回</el-button>
        </el-form-item>
      </el-form>

      <el-alert
        title="学习模式说明"
        type="info"
        :closable="false"
        style="margin-top: 20px;"
      >
        <ul style="margin: 5px 0; padding-left: 20px;">
          <li>鼠标悬停在题目上可查看答案</li>
          <li>按空格键可切换显示/隐藏答案</li>
          <li>移动端长按题目可查看答案</li>
          <li>使用左右方向键或按钮切换题目</li>
          <li>移动端支持左右滑动切换题目</li>
        </ul>
      </el-alert>
    </el-card>

    <!-- 学习界面 -->
    <div v-if="learnStarted" class="learn-content">
      <!-- 进度条 -->
      <el-card class="progress-card">
        <div class="progress-info">
          <span class="progress-text">
            第 {{ currentIndex + 1 }} / {{ questions.length }} 题
          </span>
          <el-progress 
            :percentage="Math.round(((currentIndex + 1) / questions.length) * 100)"
            :stroke-width="10"
          />
        </div>
      </el-card>

      <!-- 题目卡片 -->
      <el-card 
        class="question-card" 
        v-if="currentQuestion"
        @mouseenter="showAnswer = true"
        @mouseleave="showAnswer = false"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <div class="question-header">
          <el-tag :type="getQuestionTypeTag(currentQuestion.type)">
            {{ getQuestionTypeName(currentQuestion.type) }}
          </el-tag>
        </div>
        
        <h3 class="question-content">
          {{ currentIndex + 1 }}. {{ currentQuestion.content }}
        </h3>

        <!-- 选项 -->
        <div v-if="currentQuestion.options" class="answer-options">
          <div 
            v-for="option in currentQuestion.options" 
            :key="option.key"
            class="option-item"
            :class="{ 
              'correct-option': showAnswer && isCorrectOption(option.key, currentQuestion.result)
            }"
          >
            <span class="option-key">{{ option.key }}.</span>
            <span class="option-value">{{ option.value }}</span>
          </div>
        </div>

        <!-- 答案显示 -->
        <transition name="answer-fade">
          <div v-if="showAnswer" class="answer-display">
            <el-divider />
            <div class="answer-info">
              <el-icon class="answer-icon"><Check /></el-icon>
              <span class="answer-label">正确答案：</span>
              <span class="answer-value">{{ currentQuestion.result }}</span>
            </div>
          </div>
        </transition>

        <!-- 提示文字 -->
        <div v-if="!showAnswer" class="hint-text">
          <el-text type="info" size="small">
            <el-icon><View /></el-icon>
            悬停/长按题目查看答案，按空格键切换
          </el-text>
        </div>
      </el-card>

      <!-- 导航按钮 -->
      <div class="navigation-buttons">
        <el-button 
          size="large"
          :disabled="currentIndex === 0"
          @click="prevQuestion"
        >
          <el-icon><ArrowLeft /></el-icon>
          上一题
        </el-button>
        <el-button 
          size="large"
          @click="finishLearn"
        >
          <el-icon><CircleClose /></el-icon>
          结束学习
        </el-button>
        <el-button 
          size="large"
          :disabled="currentIndex === questions.length - 1"
          @click="nextQuestion"
        >
          下一题
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, View, ArrowLeft, ArrowRight, CircleClose } from '@element-plus/icons-vue'
import { getRandomQuestions } from '../utils/questions'
import { getMasteredQuestions } from '../utils/storage'

const router = useRouter()

// 表单数据
const learnForm = ref({
  type: 'bool',
  count: 20,
  boolCount: 10,
  chooseCount: 10,
  multiCount: 10,
  excludeMastered: false
})

// 状态
const learnStarted = ref(false)
const questions = ref([])
const currentIndex = ref(0)
const showAnswer = ref(false)

// 触摸相关
let touchStartX = 0
let touchStartY = 0
let touchStartTime = 0
let longPressTimer = null

// 已掌握题目数量
const masteredCount = computed(() => {
  return getMasteredQuestions().length
})

// 当前题目
const currentQuestion = computed(() => {
  return questions.value[currentIndex.value]
})

// 开始学习
const startLearn = () => {
  const { type, count, boolCount, chooseCount, multiCount, excludeMastered } = learnForm.value
  
  if (type === 'mixed') {
    const total = boolCount + chooseCount + multiCount
    if (total === 0) {
      ElMessage.warning('请至少选择一种题型')
      return
    }
    
    const boolQuestions = boolCount > 0 ? getRandomQuestions('bool', boolCount, excludeMastered) : []
    const chooseQuestions = chooseCount > 0 ? getRandomQuestions('choose', chooseCount, excludeMastered) : []
    const multiQuestions = multiCount > 0 ? getRandomQuestions('multi', multiCount, excludeMastered) : []
    
    questions.value = [...boolQuestions, ...chooseQuestions, ...multiQuestions]
  } else {
    questions.value = getRandomQuestions(type, count, excludeMastered)
  }
  
  if (questions.value.length === 0) {
    ElMessage.warning('没有符合条件的题目，请调整设置')
    return
  }
  
  learnStarted.value = true
  currentIndex.value = 0
  showAnswer.value = false
}

// 上一题
const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    showAnswer.value = false
  }
}

// 下一题
const nextQuestion = () => {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    showAnswer.value = false
  }
}

// 结束学习
const finishLearn = () => {
  learnStarted.value = false
  questions.value = []
  currentIndex.value = 0
  showAnswer.value = false
  ElMessage.success('学习完成！')
}

// 键盘事件处理
const handleKeydown = (e) => {
  if (!learnStarted.value) return
  
  switch(e.key) {
    case ' ':
    case 'Spacebar':
      e.preventDefault()
      showAnswer.value = !showAnswer.value
      break
    case 'ArrowLeft':
      e.preventDefault()
      prevQuestion()
      break
    case 'ArrowRight':
      e.preventDefault()
      nextQuestion()
      break
  }
}

// 触摸开始
const handleTouchStart = (e) => {
  const touch = e.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  touchStartTime = Date.now()
  
  // 设置长按定时器
  longPressTimer = setTimeout(() => {
    showAnswer.value = true
    // 触觉反馈（如果支持）
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }, 500) // 500ms长按
}

// 触摸结束
const handleTouchEnd = (e) => {
  // 清除长按定时器
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  
  const touch = e.changedTouches[0]
  const deltaX = touch.clientX - touchStartX
  const deltaY = touch.clientY - touchStartY
  const deltaTime = Date.now() - touchStartTime
  
  // 判断是否为滑动手势（快速移动且主要是横向）
  if (deltaTime < 300 && Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 2) {
    if (deltaX > 0) {
      // 向右滑动 - 上一题
      prevQuestion()
    } else {
      // 向左滑动 - 下一题
      nextQuestion()
    }
  }
}

// 判断是否为正确选项
const isCorrectOption = (optionKey, correctAnswer) => {
  if (correctAnswer.includes(',')) {
    // 多选题
    return correctAnswer.split(',').includes(optionKey)
  } else {
    // 单选题
    return optionKey === correctAnswer
  }
}

// 获取题型标签类型
const getQuestionTypeTag = (type) => {
  const tags = {
    'bool': 'info',
    'choose': 'success',
    'multi': 'warning'
  }
  return tags[type] || 'info'
}

// 获取题型名称
const getQuestionTypeName = (type) => {
  const names = {
    'bool': '判断题',
    'choose': '单选题',
    'multi': '多选题'
  }
  return names[type] || '未知'
}

// 生命周期
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (longPressTimer) {
    clearTimeout(longPressTimer)
  }
})
</script>

<style scoped>
.learn-container {
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
}

.settings-card {
  margin-top: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
}

.learn-content {
  margin-top: 20px;
}

.progress-card {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-text {
  font-size: 16px;
  font-weight: 500;
  color: #409eff;
}

.question-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  -webkit-user-select: none;
}

.question-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.question-header {
  margin-bottom: 15px;
}

.question-content {
  font-size: 18px;
  line-height: 1.8;
  margin: 15px 0;
  color: #303133;
}

.answer-options {
  margin: 20px 0;
}

.option-item {
  padding: 12px 16px;
  margin: 10px 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: flex-start;
}

.option-item.correct-option {
  background-color: #f0f9ff;
  border-color: #67c23a;
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.1);
}

.option-key {
  font-weight: 600;
  margin-right: 8px;
  color: #409eff;
  flex-shrink: 0;
}

.option-value {
  flex: 1;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.answer-display {
  margin-top: 20px;
  padding: 16px;
  background-color: #f0f9ff;
  border-radius: 4px;
}

.answer-info {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.answer-icon {
  color: #67c23a;
  font-size: 20px;
  margin-right: 8px;
}

.answer-label {
  font-weight: 600;
  color: #606266;
  margin-right: 8px;
}

.answer-value {
  color: #67c23a;
  font-weight: 600;
  font-size: 18px;
}

.answer-fade-enter-active,
.answer-fade-leave-active {
  transition: all 0.3s ease;
}

.answer-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.answer-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.hint-text {
  margin-top: 20px;
  text-align: center;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 20px;
}

.navigation-buttons .el-button {
  flex: 1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .question-content {
    font-size: 16px;
  }

  .option-item {
    padding: 10px 12px;
  }

  .answer-value {
    font-size: 16px;
  }

  .navigation-buttons {
    flex-direction: column;
  }

  .navigation-buttons .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .el-form-item__label {
    font-size: 14px;
  }

  .question-content {
    font-size: 15px;
  }

  .option-key {
    font-size: 14px;
  }

  .option-value {
    font-size: 14px;
  }
}
</style>
