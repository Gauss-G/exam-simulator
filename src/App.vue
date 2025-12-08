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
  padding: 0 15px;
}

.header-content h1 {
  margin: 0 20px 0 0;
  font-size: 20px;
  color: #409eff;
  white-space: nowrap;
  flex-shrink: 0;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px;
  width: 100%;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header {
    height: auto !important;
  }
  
  .header-content {
    flex-direction: column;
    padding: 10px;
    align-items: flex-start;
  }
  
  .header-content h1 {
    margin: 5px 0;
    font-size: 18px;
  }
  
  .header-content :deep(.el-menu) {
    width: 100%;
  }
  
  .header-content :deep(.el-menu-item) {
    padding: 0 10px;
    font-size: 14px;
  }
  
  .main-content {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: 16px;
  }
  
  .header-content :deep(.el-menu-item) {
    padding: 0 8px;
    font-size: 12px;
  }
}
</style>
