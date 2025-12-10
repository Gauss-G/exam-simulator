<template>
  <el-dialog
    v-model="showPrompt"
    title="安装应用"
    width="90%"
    :close-on-click-modal="false"
    class="install-dialog"
  >
    <div class="install-content">
      <div v-if="isIOS" class="ios-guide">
        <h3>📱 在 iPhone 上安装</h3>
        <ol class="install-steps">
          <li>
            <span class="step-icon">1️⃣</span>
            <span>点击底部的<strong>分享按钮</strong> 
              <el-icon style="vertical-align: middle;"><Upload /></el-icon>
            </span>
          </li>
          <li>
            <span class="step-icon">2️⃣</span>
            <span>向下滚动找到<strong>"添加到主屏幕"</strong></span>
          </li>
          <li>
            <span class="step-icon">3️⃣</span>
            <span>点击<strong>"添加"</strong>完成安装</span>
          </li>
        </ol>
        <el-alert
          title="安装后可以像原生应用一样使用，支持离线访问！"
          type="success"
          :closable="false"
          style="margin-top: 15px;"
        />
      </div>

      <div v-else-if="isAndroid" class="android-guide">
        <h3>📱 在 Android 上安装</h3>
        <ol class="install-steps">
          <li>
            <span class="step-icon">1️⃣</span>
            <span>点击浏览器菜单 <strong>⋮</strong></span>
          </li>
          <li>
            <span class="step-icon">2️⃣</span>
            <span>选择<strong>"安装应用"</strong>或<strong>"添加到主屏幕"</strong></span>
          </li>
          <li>
            <span class="step-icon">3️⃣</span>
            <span>点击<strong>"安装"</strong>完成</span>
          </li>
        </ol>
        <el-button 
          v-if="deferredPrompt"
          type="primary" 
          @click="installPWA"
          style="margin-top: 15px; width: 100%;"
        >
          立即安装
        </el-button>
        <el-alert
          v-else
          title="如果没有看到安装选项，请确保使用 Chrome 或 Edge 浏览器"
          type="info"
          :closable="false"
          style="margin-top: 15px;"
        />
      </div>

      <div v-else class="desktop-guide">
        <h3>💻 在电脑上安装</h3>
        <ol class="install-steps">
          <li>
            <span class="step-icon">1️⃣</span>
            <span>点击地址栏右侧的<strong>安装图标</strong> 
              <el-icon style="vertical-align: middle;"><Download /></el-icon>
            </span>
          </li>
          <li>
            <span class="step-icon">2️⃣</span>
            <span>点击<strong>"安装"</strong>完成</span>
          </li>
        </ol>
        <el-button 
          v-if="deferredPrompt"
          type="primary" 
          @click="installPWA"
          style="margin-top: 15px; width: 100%;"
        >
          立即安装
        </el-button>
        <el-alert
          title="支持 Chrome、Edge 等现代浏览器"
          type="info"
          :closable="false"
          style="margin-top: 15px;"
        />
      </div>
    </div>

    <template #footer>
      <el-checkbox v-model="dontShowAgain" style="float: left;">不再提示</el-checkbox>
      <el-button @click="closePrompt">我知道了</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Upload, Download } from '@element-plus/icons-vue'

const showPrompt = ref(false)
const dontShowAgain = ref(false)
const deferredPrompt = ref(null)

// 检测设备类型
const isIOS = computed(() => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
})

const isAndroid = computed(() => {
  return /Android/.test(navigator.userAgent)
})

// 检查是否已安装或已经显示过
const shouldShowPrompt = () => {
  // 已经是 PWA 模式
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return false
  }
  
  // 检查是否设置了不再提示
  const hideInstallPrompt = localStorage.getItem('hideInstallPrompt')
  if (hideInstallPrompt === 'true') {
    return false
  }
  
  // 检查访问次数
  let visitCount = parseInt(localStorage.getItem('visitCount') || '0')
  visitCount++
  localStorage.setItem('visitCount', visitCount.toString())
  
  // 第2次访问时显示提示
  return visitCount === 2
}

// 监听 beforeinstallprompt 事件（非 iOS）
onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
  })
  
  // 延迟显示提示
  setTimeout(() => {
    if (shouldShowPrompt()) {
      showPrompt.value = true
    }
  }, 3000) // 3秒后显示
})

// 安装 PWA
const installPWA = async () => {
  if (!deferredPrompt.value) return
  
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  
  if (outcome === 'accepted') {
    console.log('用户接受了安装')
  }
  
  deferredPrompt.value = null
  closePrompt()
}

// 关闭提示
const closePrompt = () => {
  if (dontShowAgain.value) {
    localStorage.setItem('hideInstallPrompt', 'true')
  }
  showPrompt.value = false
}

// 暴露方法供父组件调用
defineExpose({
  show: () => { showPrompt.value = true }
})
</script>

<style scoped>
.install-content {
  padding: 10px 0;
}

.install-content h3 {
  color: #409eff;
  margin: 0 0 20px 0;
  font-size: 18px;
}

.install-steps {
  list-style: none;
  padding: 0;
  margin: 0;
}

.install-steps li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  line-height: 1.8;
}

.step-icon {
  margin-right: 10px;
  font-size: 20px;
  flex-shrink: 0;
}

.install-steps strong {
  color: #409eff;
  font-weight: 600;
}

:deep(.install-dialog) {
  max-width: 500px;
}

@media (max-width: 768px) {
  .install-content h3 {
    font-size: 16px;
  }
  
  .install-steps li {
    font-size: 14px;
  }
  
  .step-icon {
    font-size: 18px;
  }
}
</style>
