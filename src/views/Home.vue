<template>
  <div class="home-page">
    <el-card class="welcome-card">
      <h2>欢迎使用模拟考试系统</h2>
      <p>本系统提供模拟考试、练习模式和错题集功能，帮助您更好地备考。</p>
    </el-card>

    <el-row :gutter="20" class="feature-cards">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="feature-card" shadow="hover" @click="goTo('/exam')">
          <div class="feature-icon">
            <el-icon :size="48" color="#409eff">
              <Document />
            </el-icon>
          </div>
          <h3>模拟考试</h3>
          <p>90分钟完整模拟考试</p>
          <ul class="feature-list">
            <li>判断题 40 道（0.5分/题）</li>
            <li>选择题 140 道（0.5分/题）</li>
            <li>多选题 10 道（1分/题）</li>
          </ul>
          <el-button type="primary" class="start-btn">开始考试</el-button>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="feature-card" shadow="hover" @click="goTo('/practice')">
          <div class="feature-icon">
            <el-icon :size="48" color="#67c23a">
              <Edit />
            </el-icon>
          </div>
          <h3>练习模式</h3>
          <p>自定义题型和数量练习</p>
          <ul class="feature-list">
            <li>选择题型进行练习</li>
            <li>自定义题目数量</li>
            <li>自动记录已掌握题目</li>
          </ul>
          <el-button type="success" class="start-btn">开始练习</el-button>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="feature-card" shadow="hover" @click="goTo('/wrong-questions')">
          <div class="feature-icon">
            <el-icon :size="48" color="#f56c6c">
              <Warning />
            </el-icon>
          </div>
          <h3>错题集</h3>
          <p>查看和练习错题</p>
          <ul class="feature-list">
            <li>自动记录错题</li>
            <li>查看正确答案</li>
            <li>重新练习错题</li>
          </ul>
          <el-button type="danger" class="start-btn">查看错题</el-button>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="stats-card">
      <h3>学习统计</h3>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-number">{{ masteredCount }}</div>
            <div class="stat-label">已掌握题目</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-number">{{ wrongCount }}</div>
            <div class="stat-label">错题数量</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-number">{{ totalQuestions }}</div>
            <div class="stat-label">题库总数</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Edit, Warning } from '@element-plus/icons-vue'
import { getMasteredQuestions, getWrongQuestions } from '../utils/storage'
import questionsBool from '../../questions/questions_bool.json'
import questionsChoose from '../../questions/questions_choose.json'
import questionsMulti from '../../questions/questions_multi.json'

const router = useRouter()
const masteredCount = ref(0)
const wrongCount = ref(0)
const totalQuestions = ref(0)

onMounted(() => {
  masteredCount.value = getMasteredQuestions().length
  wrongCount.value = getWrongQuestions().length
  totalQuestions.value = questionsBool.length + questionsChoose.length + questionsMulti.length
})

const goTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.home-page {
  padding: 20px 0;
}

.welcome-card {
  margin-bottom: 30px;
  text-align: center;
}

.welcome-card h2 {
  color: #303133;
  margin-bottom: 10px;
}

.welcome-card p {
  color: #606266;
  font-size: 16px;
}

.feature-cards {
  margin-bottom: 30px;
}

.feature-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
  margin-bottom: 20px;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  margin-bottom: 20px;
}

.feature-card h3 {
  color: #303133;
  margin-bottom: 10px;
}

.feature-card p {
  color: #909399;
  margin-bottom: 15px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  text-align: left;
}

.feature-list li {
  padding: 5px 0;
  color: #606266;
}

.feature-list li:before {
  content: "✓ ";
  color: #67c23a;
  font-weight: bold;
  margin-right: 5px;
}

.start-btn {
  width: 100%;
  margin-top: 10px;
}

.stats-card h3 {
  margin-bottom: 20px;
  color: #303133;
}

.stat-item {
  text-align: center;
  padding: 20px;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .home-page {
    padding: 10px 0;
  }
  
  .welcome-card h2 {
    font-size: 20px;
  }
  
  .welcome-card p {
    font-size: 14px;
  }
  
  .feature-card h3 {
    font-size: 18px;
  }
  
  .feature-list {
    font-size: 14px;
  }
  
  .stat-item {
    padding: 15px 10px;
  }
  
  .stat-number {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .feature-icon :deep(.el-icon) {
    font-size: 36px !important;
  }
  
  .stat-number {
    font-size: 24px;
  }
}
</style>
