// LocalStorage 管理

const STORAGE_KEYS = {
  MASTERED_QUESTIONS: 'mastered_questions', // 已掌握的题目
  WRONG_QUESTIONS: 'wrong_questions', // 错题集
  QUESTION_STATS: 'question_stats', // 题目统计（答对次数）
}

// 获取数据
export function getStorageData(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('读取数据失败:', error)
    return null
  }
}

// 保存数据
export function setStorageData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('保存数据失败:', error)
    return false
  }
}

// 获取已掌握的题目列表
export function getMasteredQuestions() {
  return getStorageData(STORAGE_KEYS.MASTERED_QUESTIONS) || []
}

// 添加已掌握的题目
export function addMasteredQuestion(questionId) {
  const mastered = getMasteredQuestions()
  if (!mastered.includes(questionId)) {
    mastered.push(questionId)
    setStorageData(STORAGE_KEYS.MASTERED_QUESTIONS, mastered)
  }
}

// 获取错题集
export function getWrongQuestions() {
  return getStorageData(STORAGE_KEYS.WRONG_QUESTIONS) || []
}

// 添加错题
export function addWrongQuestion(question) {
  const wrongQuestions = getWrongQuestions()
  const existIndex = wrongQuestions.findIndex(q => 
    q.index === question.index && q.type === question.type
  )
  
  const wrongQuestion = {
    ...question,
    addTime: new Date().toISOString()
  }
  
  if (existIndex >= 0) {
    wrongQuestions[existIndex] = wrongQuestion
  } else {
    wrongQuestions.push(wrongQuestion)
  }
  
  setStorageData(STORAGE_KEYS.WRONG_QUESTIONS, wrongQuestions)
}

// 从错题集移除
export function removeWrongQuestion(questionId, type) {
  const wrongQuestions = getWrongQuestions()
  const filtered = wrongQuestions.filter(q => 
    !(q.index === questionId && q.type === type)
  )
  setStorageData(STORAGE_KEYS.WRONG_QUESTIONS, filtered)
}

// 获取题目统计
export function getQuestionStats() {
  return getStorageData(STORAGE_KEYS.QUESTION_STATS) || {}
}

// 更新题目统计
export function updateQuestionStats(questionId, type, isCorrect) {
  const stats = getQuestionStats()
  const key = `${type}_${questionId}`
  
  if (!stats[key]) {
    stats[key] = { correctCount: 0, totalCount: 0 }
  }
  
  stats[key].totalCount++
  if (isCorrect) {
    stats[key].correctCount++
  }
  
  setStorageData(STORAGE_KEYS.QUESTION_STATS, stats)
  
  // 如果连续答对5次，标记为已掌握
  if (stats[key].correctCount >= 5) {
    addMasteredQuestion(key)
  }
  
  return stats[key]
}

// 清除所有数据
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}
