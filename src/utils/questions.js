// 题库数据管理
import questionsBool from '../../questions/questions_bool.json'
import questionsChoose from '../../questions/questions_choose.json'
import questionsMulti from '../../questions/questions_multi.json'

// 题库数据缓存
const questionCache = {
  bool: questionsBool,
  choose: questionsChoose,
  multi: questionsMulti
}

// 随机抽取题目（支持排除已掌握）
export function getRandomQuestions(type, count, excludeMastered = false) {
  let questions = []
  switch (type) {
    case 'bool':
      questions = [...questionCache.bool]
      break
    case 'choose':
      questions = [...questionCache.choose]
      break
    case 'multi':
      questions = [...questionCache.multi]
      break
  }
  
  console.log(`获取${type}题目，总数：${questions.length}，请求数量：${count}，排除已掌握：${excludeMastered}`)
  
  // 如果需要排除已掌握的题目
  if (excludeMastered) {
    const { getMasteredQuestions } = require('./storage')
    const masteredList = getMasteredQuestions()
    console.log('已掌握题目列表：', masteredList)
    
    const beforeCount = questions.length
    questions = questions.filter(q => {
      const key = `${type}_${q.index}`
      const isMastered = masteredList.includes(key)
      if (isMastered) {
        console.log(`过滤掉已掌握题目：${key}`)
      }
      return !isMastered
    })
    console.log(`过滤后剩余题目数：${questions.length}（过滤前：${beforeCount}）`)
  }
  
  // 如果没有可用题目，返回空数组
  if (questions.length === 0) {
    console.log('没有可用题目')
    return []
  }
  
  // 洗牌算法随机抽取
  const shuffled = questions.sort(() => 0.5 - Math.random())
  // 取可用题目数量和请求数量的较小值
  const actualCount = Math.min(count, questions.length)
  console.log(`实际返回题目数：${actualCount}`)
  
  return shuffled.slice(0, actualCount).map((q, idx) => ({
    ...q,
    id: `${type}_${idx}`,
    type,
    userAnswer: type === 'multi' ? [] : ''
  }))
}

// 生成考试题目
export function generateExamQuestions() {
  const boolQuestions = getRandomQuestions('bool', 40)
  const chooseQuestions = getRandomQuestions('choose', 140)
  const multiQuestions = getRandomQuestions('multi', 10)
  
  return [...boolQuestions, ...chooseQuestions, ...multiQuestions]
}

// 计算分数
export function calculateScore(questions) {
  let score = 0
  let totalScore = 0
  
  questions.forEach(q => {
    let questionScore = 0
    if (q.type === 'bool' || q.type === 'choose') {
      questionScore = 0.5
      totalScore += 0.5
      if (q.userAnswer === q.result) {
        score += 0.5
      }
    } else if (q.type === 'multi') {
      questionScore = 1
      totalScore += 1
      const userAnswer = Array.isArray(q.userAnswer) ? q.userAnswer.sort().join('') : q.userAnswer
      const correctAnswer = q.result
      if (userAnswer === correctAnswer) {
        score += 1
      }
    }
  })
  
  return { score, totalScore }
}

// 检查答案是否正确
export function checkAnswer(question) {
  if (question.type === 'multi') {
    const userAnswer = Array.isArray(question.userAnswer) 
      ? question.userAnswer.sort().join('') 
      : question.userAnswer
    return userAnswer === question.result
  }
  return question.userAnswer === question.result
}
