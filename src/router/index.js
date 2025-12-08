import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Exam from '../views/Exam.vue'
import Practice from '../views/Practice.vue'
import WrongQuestions from '../views/WrongQuestions.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/exam',
    name: 'Exam',
    component: Exam
  },
  {
    path: '/practice',
    name: 'Practice',
    component: Practice
  },
  {
    path: '/wrong-questions',
    name: 'WrongQuestions',
    component: WrongQuestions
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
