<template>
  <div class="exam-page">
    <!-- 考试开始前 -->
    <el-card v-if="!examStarted && !showResult">
      <h2>模拟考试说明</h2>
      <el-alert type="info" :closable="false" style="margin: 20px 0;">
        <ul class="exam-info">
          <li>考试时间：90 分钟</li>
          <li>判断题：40 道（每题 0.5 分）</li>
          <li>选择题：140 道（每题 0.5 分）</li>
          <li>多选题：10 道（每题 1 分）</li>
          <li>总分：100 分</li>
        </ul>
      </el-alert>
      <el-button type="primary" size="large" @click="startExam">开始考试</el-button>
    </el-card>

    <!-- 考试进行中 -->
    <div v-if="examStarted && !showResult">
      <!-- 顶部信息栏 -->
      <el-card class="exam-header">
        <el-row justify="space-between">
          <el-col :span="12">
            <div class="progress-info">
              <span>进度：{{ currentIndex + 1 }} / {{ questions.length }}</span>
            </div>
          </el-col>
          <el-col :span="12" style="text-align: right;">
            <div class="timer">
              <el-icon><Clock /></el-icon>
              剩余时间：{{ formatTime(remainingTime) }}
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 题目卡片 -->
      <el-card class="question-card" v-if="currentQuestion">
        <div class="question-header">
          <el-tag :type="getQuestionTypeTag(currentQuestion.type)">
            {{ getQuestionTypeName(currentQuestion.type) }}
          </el-tag>
          <span class="question-score">{{ getQuestionScore(currentQuestion.type) }}分</span>
        </div>
        
        <h3 class="question-content">
          {{ currentIndex + 1 }}. {{ currentQuestion.content }}
        </h3>

        <!-- 判断题 -->
        <el-radio-group 
          v-if="currentQuestion.type === 'bool'" 
          v-model="currentQuestion.userAnswer"
          class="answer-options"
        >
          <el-radio label="正确" size="large">正确</el-radio>
          <el-radio label="错误" size="large">错误</el-radio>
        </el-radio-group>

        <!-- 单选题 -->
        <el-radio-group 
          v-else-if="currentQuestion.type === 'choose'" 
          v-model="currentQuestion.userAnswer"
          class="answer-options"
        >
          <el-radio 
            v-for="option in currentQuestion.options" 
            :key="option.key"
            :label="option.key"
            size="large"
          >
            {{ option.key }}. {{ option.value }}
          </el-radio>
        </el-radio-group>

        <!-- 多选题 -->
        <el-checkbox-group 
          v-else-if="currentQuestion.type === 'multi'" 
          v-model="currentQuestion.userAnswer"
          class="answer-options"
        >
          <el-checkbox 
            v-for="option in currentQuestion.options" 
            :key="option.key"
            :label="option.key"
            size="large"
          >
            {{ option.key }}. {{ option.value }}
          </el-checkbox>
        </el-checkbox-group>

        <!-- 导航按钮 -->
        <div class="question-nav">
          <el-button 
            @click="prevQuestion" 
            :disabled="currentIndex === 0"
          >
            上一题
          </el-button>
          <el-button 
            type="primary" 
            @click="nextQuestion"
            v-if="currentIndex < questions.length - 1"
          >
            下一题
          </el-button>
          <el-button 
            type="success" 
            @click="submitExam"
            v-else
          >
            提交考试
          </el-button>
        </div>
      </el-card>

      <!-- 答题卡 -->
      <el-card class="answer-sheet">
        <h4>答题卡</h4>
        <div class="answer-grid">
          <div 
            v-for="(q, index) in questions" 
            :key="q.id"
            :class="['answer-item', {
              'current': index === currentIndex,
              'answered': isAnswered(q)
            }]"
            @click="jumpToQuestion(index)"
          >
            {{ index + 1 }}
          </div>
        </div>
      </el-card>
    </div>

    <!-- 考试结果 -->
    <el-card v-if="showResult" class="result-card">
      <el-result
        :icon="examResult.score >= 60 ? 'success' : 'error'"
        :title="examResult.score >= 60 ? '考试通过！' : '未通过考试'"
        :sub-title="`得分：${examResult.score} / ${examResult.totalScore}`"
      >
        <template #extra>
          <el-button type="primary" @click="viewAnswers">查看答案</el-button>
          <el-button @click="backToHome">返回首页</el-button>
          <el-button @click="restartExam">重新考试</el-button>
        </template>
      </el-result>

      <!-- 答案详情 -->
      <div v-if="showAnswers" class="answers-detail">
        <el-divider />
        <h3>答案详情</h3>
        <div v-for="(q, index) in questions" :key="q.id" class="answer-detail-item">
          <div class="detail-header">
            <span class="detail-number">{{ index + 1 }}.</span>
            <el-tag 
              :type="checkAnswer(q) ? 'success' : 'danger'"
              size="small"
            >
              {{ checkAnswer(q) ? '正确' : '错误' }}
            </el-tag>
            <el-tag :type="getQuestionTypeTag(q.type)" size="small">
              {{ getQuestionTypeName(q.type) }}
            </el-tag>
          </div>
          <div class="detail-content">{{ q.content }}</div>
          <div class="detail-answer">
            <div>你的答案：<span :class="checkAnswer(q) ? 'correct' : 'wrong'">{{ formatAnswer(q.userAnswer) }}</span></div>
            <div>正确答案：<span class="correct">{{ q.result }}</span></div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Clock } from '@element-plus/icons-vue'
import { generateExamQuestions, calculateScore, checkAnswer as checkQuestionAnswer } from '../utils/questions'
import { addWrongQuestion, updateQuestionStats } from '../utils/storage'

const router = useRouter()

const examStarted = ref(false)
const showResult = ref(false)
const showAnswers = ref(false)
const questions = ref([])
const currentIndex = ref(0)
const remainingTime = ref(90 * 60) // 90分钟，单位秒
const timer = ref(null)
const examResult = ref({ score: 0, totalScore: 100 })

const currentQuestion = computed(() => questions.value[currentIndex.value])

// 开始考试
const startExam = () => {
  questions.value = generateExamQuestions()
  examStarted.value = true
  startTimer()
}

// 启动计时器
const startTimer = () => {
  timer.value = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      clearInterval(timer.value)
      ElMessage.warning('考试时间到，自动提交！')
      submitExam()
    }
  }, 1000)
}

// 格式化时间
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// 上一题
const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

// 下一题
const nextQuestion = () => {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  }
}

// 跳转到指定题目
const jumpToQuestion = (index) => {
  currentIndex.value = index
}

// 检查是否已答题
const isAnswered = (question) => {
  if (question.type === 'multi') {
    return question.userAnswer && question.userAnswer.length > 0
  }
  return question.userAnswer !== ''
}

// 提交考试
const submitExam = async () => {
  // 检查是否有未答题目
  const unanswered = questions.value.filter(q => !isAnswered(q))
  
  if (unanswered.length > 0) {
    try {
      await ElMessageBox.confirm(
        `还有 ${unanswered.length} 道题未作答，确定要提交吗？`,
        '提示',
        {
          confirmButtonText: '确定提交',
          cancelButtonText: '继续答题',
          type: 'warning'
        }
      )
    } catch {
      return
    }
  }

  // 清除计时器
  if (timer.value) {
    clearInterval(timer.value)
  }

  // 计算成绩
  const result = calculateScore(questions.value)
  examResult.value = result

  // 记录错题和统计
  questions.value.forEach(q => {
    const isCorrect = checkQuestionAnswer(q)
    updateQuestionStats(q.index, q.type, isCorrect)
    
    if (!isCorrect) {
      addWrongQuestion(q)
    }
  })

  examStarted.value = false
  showResult.value = true
}

// 查看答案
const viewAnswers = () => {
  showAnswers.value = !showAnswers.value
}

// 返回首页
const backToHome = () => {
  router.push('/')
}

// 重新考试
const restartExam = () => {
  examStarted.value = false
  showResult.value = false
  showAnswers.value = false
  currentIndex.value = 0
  remainingTime.value = 90 * 60
  questions.value = []
}

// 检查答案
const checkAnswer = (question) => {
  return checkQuestionAnswer(question)
}

// 格式化答案显示
const formatAnswer = (answer) => {
  if (Array.isArray(answer)) {
    return answer.sort().join('') || '未作答'
  }
  return answer || '未作答'
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

// 获取题目分值
const getQuestionScore = (type) => {
  return type === 'multi' ? 1 : 0.5
}

// 组件卸载时清除计时器
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.exam-page {
  max-width: 900px;
  margin: 0 auto;
}

.exam-info {
  list-style: none;
  padding: 0;
}

.exam-info li {
  padding: 5px 0;
  font-size: 16px;
}

.exam-header {
  margin-bottom: 20px;
}

.progress-info {
  font-size: 16px;
  font-weight: bold;
}

.timer {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
}

.question-card {
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.question-score {
  font-weight: bold;
  color: #409eff;
}

.question-content {
  margin: 20px 0;
  font-size: 18px;
  line-height: 1.8;
  color: #303133;
}

.answer-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 30px 0;
}

.answer-options :deep(.el-radio),
.answer-options :deep(.el-checkbox) {
  margin-right: 0;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s;
}

.answer-options :deep(.el-radio:hover),
.answer-options :deep(.el-checkbox:hover) {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.answer-options :deep(.el-radio.is-checked),
.answer-options :deep(.el-checkbox.is-checked) {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.question-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.answer-sheet h4 {
  margin-bottom: 15px;
  color: #303133;
}

.answer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  gap: 10px;
}

.answer-item {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
}

.answer-item:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.answer-item.current {
  border-color: #409eff;
  background-color: #409eff;
  color: white;
}

.answer-item.answered {
  background-color: #67c23a;
  border-color: #67c23a;
  color: white;
}

.answer-item.answered.current {
  background-color: #409eff;
  border-color: #409eff;
}

.result-card {
  margin-top: 20px;
}

.answers-detail {
  margin-top: 30px;
}

.answers-detail h3 {
  margin-bottom: 20px;
  color: #303133;
}

.answer-detail-item {
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 15px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.detail-number {
  font-weight: bold;
  font-size: 16px;
}

.detail-content {
  margin: 10px 0;
  line-height: 1.6;
  color: #303133;
}

.detail-answer {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.detail-answer > div {
  margin: 5px 0;
}

.correct {
  color: #67c23a;
  font-weight: bold;
}

.wrong {
  color: #f56c6c;
  font-weight: bold;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .exam-page {
    max-width: 100%;
  }
  
  .timer {
    font-size: 16px;
  }
  
  .question-content {
    font-size: 16px;
  }
  
  .answer-grid {
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 8px;
  }
  
  .answer-item {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
  
  .answer-options :deep(.el-radio),
  .answer-options :deep(.el-checkbox) {
    padding: 12px;
  }
  
  .answer-options :deep(.el-radio__label),
  .answer-options :deep(.el-checkbox__label) {
    font-size: 14px;
  }
  
  .answer-detail-item {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .question-content {
    font-size: 15px;
  }
  
  .answer-grid {
    grid-template-columns: repeat(auto-fill, minmax(35px, 1fr));
    gap: 6px;
  }
  
  .answer-item {
    width: 35px;
    height: 35px;
    font-size: 12px;
  }
  
  .answer-options :deep(.el-radio),
  .answer-options :deep(.el-checkbox) {
    padding: 10px;
  }
  
  .answer-options :deep(.el-radio__label),
  .answer-options :deep(.el-checkbox__label) {
    font-size: 13px;
  }
}
</style>
