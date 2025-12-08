<template>
  <div class="wrong-questions-page">
    <el-card>
      <div class="header-section">
        <h2>错题集</h2>
        <div class="header-actions">
          <el-button 
            type="danger" 
            :disabled="wrongQuestions.length === 0"
            @click="clearWrongQuestions"
          >
            清空错题集
          </el-button>
          <el-button 
            type="primary" 
            :disabled="wrongQuestions.length === 0"
            @click="startPracticeWrong"
          >
            练习错题
          </el-button>
        </div>
      </div>

      <el-alert 
        type="info" 
        :closable="false"
        style="margin: 20px 0;"
      >
        错题集共有 {{ wrongQuestions.length }} 道题目
      </el-alert>

      <!-- 筛选 -->
      <div class="filter-section" v-if="wrongQuestions.length > 0">
        <el-radio-group v-model="filterType" @change="handleFilterChange">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="bool">判断题</el-radio-button>
          <el-radio-button label="choose">单选题</el-radio-button>
          <el-radio-button label="multi">多选题</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 错题列表 -->
      <div class="wrong-questions-list" v-if="filteredQuestions.length > 0">
        <div 
          v-for="(question, index) in filteredQuestions" 
          :key="`${question.type}_${question.index}`"
          class="wrong-question-item"
        >
          <div class="question-header">
            <div>
              <el-tag :type="getQuestionTypeTag(question.type)" size="small">
                {{ getQuestionTypeName(question.type) }}
              </el-tag>
              <span class="question-number">第 {{ index + 1 }} 题</span>
            </div>
            <el-button 
              type="danger" 
              size="small" 
              link
              @click="removeQuestion(question)"
            >
              移除
            </el-button>
          </div>

          <div class="question-content">
            {{ question.content }}
          </div>

          <!-- 选项显示 -->
          <div class="question-options" v-if="question.options">
            <div 
              v-for="option in question.options" 
              :key="option.key"
              class="option-item"
            >
              <span class="option-key">{{ option.key }}.</span>
              <span>{{ option.value }}</span>
            </div>
          </div>

          <div class="question-answer">
            <div class="answer-row">
              <span class="label">你的答案：</span>
              <span class="wrong-answer">{{ formatAnswer(question.userAnswer) }}</span>
            </div>
            <div class="answer-row">
              <span class="label">正确答案：</span>
              <span class="correct-answer">{{ question.result }}</span>
            </div>
          </div>

          <div class="question-time">
            添加时间：{{ formatTime(question.addTime) }}
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty 
        v-else
        description="暂无错题"
        :image-size="200"
      >
        <template #image>
          <el-icon :size="100" color="#909399">
            <CircleCheck />
          </el-icon>
        </template>
      </el-empty>
    </el-card>

    <!-- 练习错题对话框 -->
    <el-dialog 
      v-model="showPracticeDialog" 
      title="练习错题" 
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="practiceQuestion">
        <div class="practice-progress">
          <span>进度：{{ practiceIndex + 1 }} / {{ practiceQuestions.length }}</span>
          <el-progress 
            :percentage="Math.round(((practiceIndex + 1) / practiceQuestions.length) * 100)"
            :stroke-width="10"
          />
        </div>

        <div class="practice-question">
          <div class="question-header">
            <el-tag :type="getQuestionTypeTag(practiceQuestion.type)">
              {{ getQuestionTypeName(practiceQuestion.type) }}
            </el-tag>
          </div>
          
          <h3 class="question-content">
            {{ practiceIndex + 1 }}. {{ practiceQuestion.content }}
          </h3>

          <!-- 判断题 -->
          <el-radio-group 
            v-if="practiceQuestion.type === 'bool'" 
            v-model="practiceQuestion.userAnswer"
            class="answer-options"
          >
            <el-radio label="正确" size="large">正确</el-radio>
            <el-radio label="错误" size="large">错误</el-radio>
          </el-radio-group>

          <!-- 单选题 -->
          <el-radio-group 
            v-else-if="practiceQuestion.type === 'choose'" 
            v-model="practiceQuestion.userAnswer"
            class="answer-options"
          >
            <el-radio 
              v-for="option in practiceQuestion.options" 
              :key="option.key"
              :label="option.key"
              size="large"
            >
              {{ option.key }}. {{ option.value }}
            </el-radio>
          </el-radio-group>

          <!-- 多选题 -->
          <el-checkbox-group 
            v-else-if="practiceQuestion.type === 'multi'" 
            v-model="practiceQuestion.userAnswer"
            class="answer-options"
          >
            <el-checkbox 
              v-for="option in practiceQuestion.options" 
              :key="option.key"
              :label="option.key"
              size="large"
            >
              {{ option.key }}. {{ option.value }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button 
            @click="prevPracticeQuestion" 
            :disabled="practiceIndex === 0"
          >
            上一题
          </el-button>
          <el-button @click="showPracticeDialog = false">
            关闭
          </el-button>
          <el-button 
            type="primary" 
            @click="nextPracticeQuestion"
            v-if="practiceIndex < practiceQuestions.length - 1"
          >
            下一题
          </el-button>
          <el-button 
            type="success" 
            @click="finishWrongPractice"
            v-else
          >
            完成练习
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'
import { getWrongQuestions, removeWrongQuestion, updateQuestionStats, setStorageData } from '../utils/storage'
import { checkAnswer as checkQuestionAnswer } from '../utils/questions'

const wrongQuestions = ref([])
const filterType = ref('all')
const showPracticeDialog = ref(false)
const practiceQuestions = ref([])
const practiceIndex = ref(0)

const filteredQuestions = computed(() => {
  if (filterType.value === 'all') {
    return wrongQuestions.value
  }
  return wrongQuestions.value.filter(q => q.type === filterType.value)
})

const practiceQuestion = computed(() => practiceQuestions.value[practiceIndex.value])

onMounted(() => {
  loadWrongQuestions()
})

// 加载错题
const loadWrongQuestions = () => {
  wrongQuestions.value = getWrongQuestions()
}

// 筛选变化
const handleFilterChange = () => {
  // 筛选逻辑已通过 computed 处理
}

// 移除错题
const removeQuestion = async (question) => {
  try {
    await ElMessageBox.confirm(
      '确定要从错题集中移除这道题吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    removeWrongQuestion(question.index, question.type)
    loadWrongQuestions()
    ElMessage.success('已移除')
  } catch {
    // 用户取消
  }
}

// 清空错题集
const clearWrongQuestions = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空整个错题集吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    setStorageData('wrong_questions', [])
    loadWrongQuestions()
    ElMessage.success('错题集已清空')
  } catch {
    // 用户取消
  }
}

// 开始练习错题
const startPracticeWrong = () => {
  practiceQuestions.value = filteredQuestions.value.map(q => ({
    ...q,
    userAnswer: q.type === 'multi' ? [] : ''
  }))
  practiceIndex.value = 0
  showPracticeDialog.value = true
}

// 上一题
const prevPracticeQuestion = () => {
  if (practiceIndex.value > 0) {
    practiceIndex.value--
  }
}

// 下一题
const nextPracticeQuestion = () => {
  if (practiceIndex.value < practiceQuestions.value.length - 1) {
    practiceIndex.value++
  }
}

// 完成练习
const finishWrongPractice = () => {
  let correctCount = 0
  
  // 更新统计
  practiceQuestions.value.forEach(q => {
    const isCorrect = checkQuestionAnswer(q)
    if (isCorrect) {
      correctCount++
      // 答对了就从错题集中移除
      removeWrongQuestion(q.index, q.type)
    }
    updateQuestionStats(q.index, q.type, isCorrect)
  })

  showPracticeDialog.value = false
  loadWrongQuestions()
  
  ElMessage.success(`练习完成！正确 ${correctCount}/${practiceQuestions.value.length} 题`)
}

// 格式化答案
const formatAnswer = (answer) => {
  if (Array.isArray(answer)) {
    return answer.sort().join('') || '未作答'
  }
  return answer || '未作答'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '未知'
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
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
.wrong-questions-page {
  max-width: 1000px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-section h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  margin: 20px 0;
}

.wrong-questions-list {
  margin-top: 20px;
}

.wrong-question-item {
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: #fff;
  transition: box-shadow 0.3s;
}

.wrong-question-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.question-number {
  margin-left: 10px;
  color: #606266;
  font-size: 14px;
}

.question-content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  margin: 15px 0;
}

.question-options {
  margin: 15px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.option-item {
  padding: 8px 0;
  color: #606266;
}

.option-key {
  font-weight: bold;
  margin-right: 8px;
  color: #409eff;
}

.question-answer {
  margin: 15px 0;
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.answer-row {
  margin: 8px 0;
  display: flex;
  align-items: center;
}

.label {
  font-weight: bold;
  margin-right: 10px;
  min-width: 80px;
  color: #606266;
}

.wrong-answer {
  color: #f56c6c;
  font-weight: bold;
}

.correct-answer {
  color: #67c23a;
  font-weight: bold;
}

.question-time {
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
}

.practice-progress {
  margin-bottom: 20px;
}

.practice-progress > span {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

.practice-question {
  margin-top: 20px;
}

.practice-question .question-content {
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

.dialog-footer {
  display: flex;
  justify-content: space-between;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .wrong-questions-page {
    max-width: 100%;
  }
  
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .header-actions button {
    width: 48%;
  }
  
  .question-content {
    font-size: 15px;
  }
  
  .option-item {
    font-size: 14px;
  }
  
  .wrong-question-item {
    padding: 15px;
  }
  
  .answer-options :deep(.el-radio),
  .answer-options :deep(.el-checkbox) {
    padding: 12px;
  }
  
  .dialog-footer {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .dialog-footer button {
    flex: 1;
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .filter-section :deep(.el-radio-button__inner) {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .question-content {
    font-size: 14px;
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
