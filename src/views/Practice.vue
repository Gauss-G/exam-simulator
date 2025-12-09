<template>
  <div class="practice-page">
    <!-- 练习设置 -->
    <el-card v-if="!practiceStarted">
      <h2>练习模式设置</h2>
      
      <el-form :model="practiceForm" label-width="120px" style="margin-top: 30px;">
        <el-form-item label="练习模式">
          <el-radio-group v-model="practiceForm.mode">
            <el-radio label="single">单一题型</el-radio>
            <el-radio label="mixed">混合题型</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 单一题型模式 -->
        <template v-if="practiceForm.mode === 'single'">
          <el-form-item label="题型选择">
            <el-radio-group v-model="practiceForm.type">
              <el-radio label="bool">判断题</el-radio>
              <el-radio label="choose">单选题</el-radio>
              <el-radio label="multi">多选题</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="题目数量">
            <el-input-number 
              v-model="practiceForm.count" 
              :min="1" 
              :max="getMaxCount()"
            />
            <span class="tip">（最多 {{ getMaxCount() }} 道）</span>
          </el-form-item>
        </template>

        <!-- 混合题型模式 -->
        <template v-else>
          <el-form-item label="判断题数量">
            <el-input-number 
              v-model="practiceForm.boolCount" 
              :min="0" 
              :max="questionsBool.length"
            />
            <span class="tip">（最多 {{ questionsBool.length }} 道）</span>
          </el-form-item>

          <el-form-item label="单选题数量">
            <el-input-number 
              v-model="practiceForm.chooseCount" 
              :min="0" 
              :max="questionsChoose.length"
            />
            <span class="tip">（最多 {{ questionsChoose.length }} 道）</span>
          </el-form-item>

          <el-form-item label="多选题数量">
            <el-input-number 
              v-model="practiceForm.multiCount" 
              :min="0" 
              :max="questionsMulti.length"
            />
            <span class="tip">（最多 {{ questionsMulti.length }} 道）</span>
          </el-form-item>
        </template>

        <el-form-item label="排除已掌握">
          <el-switch v-model="practiceForm.excludeMastered" />
          <span class="tip">（排除已连续答对3次的题目）</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="startPractice">开始练习</el-button>
        </el-form-item>
      </el-form>

      <!-- 已掌握题目 -->
      <el-divider />
      <div class="mastered-section">
        <h3>已掌握题目</h3>
        <el-alert 
          type="success" 
          :closable="false"
          style="margin: 15px 0;"
        >
          已掌握 {{ masteredQuestions.length }} 道题目（连续答对3次以上）
        </el-alert>
        <el-button @click="viewMasteredQuestions" v-if="masteredQuestions.length > 0">
          查看已掌握题目
        </el-button>
      </div>
    </el-card>

    <!-- 练习进行中 -->
    <div v-if="practiceStarted && !showResult">
      <!-- 进度条 -->
      <el-card class="progress-card">
        <div class="progress-info">
          <span>进度：{{ currentIndex + 1 }} / {{ questions.length }}</span>
          <el-progress 
            :percentage="Math.round(((currentIndex + 1) / questions.length) * 100)"
            :stroke-width="10"
          />
        </div>
      </el-card>

      <!-- 题目卡片 -->
      <el-card class="question-card" v-if="currentQuestion">
        <div class="question-header">
          <el-tag :type="getQuestionTypeTag(currentQuestion.type)">
            {{ getQuestionTypeName(currentQuestion.type) }}
          </el-tag>
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
            @click="finishPractice"
            v-else
          >
            完成练习
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 练习结果 -->
    <el-card v-if="showResult" class="result-card">
      <el-result
        icon="success"
        title="练习完成！"
        :sub-title="practiceForm.mode === 'mixed' 
          ? `得分：${practiceScore.toFixed(1)} 分 (正确率：${Math.round((correctCount / questions.length) * 100)}%)`
          : `正确率：${Math.round((correctCount / questions.length) * 100)}% (${correctCount}/${questions.length})`"
      >
        <template #extra>
          <el-button type="primary" @click="viewAnswers">查看答案</el-button>
          <el-button @click="backToSettings">返回设置</el-button>
          <el-button @click="continuePractice">继续练习</el-button>
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
          </div>
          <div class="detail-content">{{ q.content }}</div>
          <div class="detail-answer">
            <div>你的答案：<span :class="checkAnswer(q) ? 'correct' : 'wrong'">{{ formatAnswer(q.userAnswer) }}</span></div>
            <div>正确答案：<span class="correct">{{ q.result }}</span></div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 已掌握题目对话框 -->
    <el-dialog v-model="showMasteredDialog" title="已掌握题目" width="80%">
      <div class="mastered-list">
        <el-empty v-if="masteredQuestions.length === 0" description="暂无已掌握题目" />
        <div v-else>
          <p class="tip">以下是您已掌握的题目（连续答对5次以上）</p>
          <div class="mastered-count">
            共 {{ masteredQuestions.length }} 道题目
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRandomQuestions, checkAnswer as checkQuestionAnswer } from '../utils/questions'
import { getMasteredQuestions, addWrongQuestion, updateQuestionStats } from '../utils/storage'
import questionsBool from '../../questions/questions_bool.json'
import questionsChoose from '../../questions/questions_choose.json'
import questionsMulti from '../../questions/questions_multi.json'

const practiceStarted = ref(false)
const showResult = ref(false)
const showAnswers = ref(false)
const showMasteredDialog = ref(false)
const questions = ref([])
const currentIndex = ref(0)
const masteredQuestions = ref([])
const practiceScore = ref(0)

const practiceForm = ref({
  mode: 'single',
  type: 'bool',
  count: 10,
  boolCount: 5,
  chooseCount: 10,
  multiCount: 5,
  excludeMastered: false
})

const currentQuestion = computed(() => questions.value[currentIndex.value])
const correctCount = computed(() => {
  return questions.value.filter(q => checkQuestionAnswer(q)).length
})

onMounted(() => {
  masteredQuestions.value = getMasteredQuestions()
})

// 获取最大题目数量
const getMaxCount = () => {
  const counts = {
    'bool': questionsBool.length,
    'choose': questionsChoose.length,
    'multi': questionsMulti.length
  }
  return counts[practiceForm.value.type] || 100
}

// 开始练习
const startPractice = () => {
  const excludeMastered = practiceForm.value.excludeMastered
  
  if (practiceForm.value.mode === 'single') {
    if (practiceForm.value.count < 1) {
      ElMessage.error('请选择至少1道题目')
      return
    }
    questions.value = getRandomQuestions(practiceForm.value.type, practiceForm.value.count, excludeMastered)
  } else {
    // 混合模式
    const { boolCount, chooseCount, multiCount } = practiceForm.value
    const total = boolCount + chooseCount + multiCount
    
    if (total < 1) {
      ElMessage.error('请至少选择1道题目')
      return
    }
    
    const boolQuestions = boolCount > 0 ? getRandomQuestions('bool', boolCount, excludeMastered) : []
    const chooseQuestions = chooseCount > 0 ? getRandomQuestions('choose', chooseCount, excludeMastered) : []
    const multiQuestions = multiCount > 0 ? getRandomQuestions('multi', multiCount, excludeMastered) : []
    
    questions.value = [...boolQuestions, ...chooseQuestions, ...multiQuestions]
  }
  
  if (questions.value.length === 0) {
    ElMessage.warning('没有符合条件的题目，请调整设置')
    return
  }
  
  practiceStarted.value = true
  currentIndex.value = 0
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

// 完成练习
const finishPractice = () => {
  // 计算分数（混合模式）
  if (practiceForm.value.mode === 'mixed') {
    let score = 0
    questions.value.forEach(q => {
      const isCorrect = checkQuestionAnswer(q)
      if (isCorrect) {
        if (q.type === 'bool' || q.type === 'choose') {
          score += 0.5
        } else if (q.type === 'multi') {
          score += 1
        }
      }
    })
    practiceScore.value = score
  }
  
  // 记录统计和错题
  questions.value.forEach(q => {
    const isCorrect = checkQuestionAnswer(q)
    updateQuestionStats(q.index, q.type, isCorrect)
    
    if (!isCorrect && q.userAnswer) {
      addWrongQuestion(q)
    }
  })

  // 更新已掌握题目列表
  masteredQuestions.value = getMasteredQuestions()

  practiceStarted.value = false
  showResult.value = true
  
  ElMessage.success('练习完成！')
}

// 查看答案
const viewAnswers = () => {
  showAnswers.value = !showAnswers.value
}

// 返回设置
const backToSettings = () => {
  practiceStarted.value = false
  showResult.value = false
  showAnswers.value = false
  currentIndex.value = 0
  questions.value = []
}

// 继续练习
const continuePractice = () => {
  showResult.value = false
  showAnswers.value = false
  startPractice()
}

// 查看已掌握题目
const viewMasteredQuestions = () => {
  showMasteredDialog.value = true
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
</script>

<style scoped>
.practice-page {
  max-width: 900px;
  margin: 0 auto;
}

.tip {
  margin-left: 10px;
  color: #909399;
  font-size: 14px;
}

.mastered-section {
  margin-top: 20px;
}

.mastered-section h3 {
  margin-bottom: 15px;
  color: #303133;
}

.progress-card {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-info > span {
  font-size: 16px;
  font-weight: bold;
}

.question-card {
  margin-bottom: 20px;
}

.question-header {
  margin-bottom: 20px;
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

.mastered-list .tip {
  margin: 0 0 15px 0;
  color: #606266;
}

.mastered-count {
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 4px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .practice-page {
    max-width: 100%;
  }
  
  .question-content {
    font-size: 16px;
  }
  
  .answer-options :deep(.el-radio),
  .answer-options :deep(.el-checkbox) {
    padding: 12px;
  }
  
  .answer-detail-item {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .question-content {
    font-size: 15px;
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
