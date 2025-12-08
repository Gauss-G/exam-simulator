<template>
  <div id="app">
    <el-container class="main-container">
      <el-header class="header">
        <div class="header-content">
          <h1>模拟考试系统</h1>
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            :ellipsis="false"
            router
          >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/exam">模拟考试</el-menu-item>
            <el-menu-item index="/practice">练习模式</el-menu-item>
            <el-menu-item index="/wrong-questions">错题集</el-menu-item>
          </el-menu>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.main-container {
  min-height: 100vh;
}

.header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,.08);
  padding: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 100%;
}

.header-content h1 {
  margin: 0 40px 0 0;
  font-size: 24px;
  color: #409eff;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}
</style>
