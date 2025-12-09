<template>
  <el-dialog
    v-model="dialogVisible"
    :width="isMobile ? '90%' : '400px'"
    align-center
    :show-close="false"
    class="donation-dialog"
  >
    <template #header>
      <div class="dialog-header">
        <div class="coffee-icon">☕</div>
        <h3 class="dialog-title">{{ currentText }}</h3>
      </div>
    </template>
    
    <div class="donation-content">
      <div class="message-box">
        <div class="sparkle">✨</div>
        <p class="donation-text">
          如果这个应用对你有帮助<br/>
          <span class="highlight">请作者喝杯咖啡吧～</span>
        </p>
        <div class="sparkle">✨</div>
      </div>
      
      <div class="qrcode-container" :class="{ 'shake': isShaking }">
        <div class="qrcode-wrapper">
          <img 
            :src="qrcodeUrl" 
            alt="赞赏码" 
            class="qrcode-image"
            @error="handleImageError"
          />
          <div class="scan-line"></div>
        </div>
        <div class="qrcode-label">
          <el-icon class="scan-icon"><Camera /></el-icon>
          扫码支持
        </div>
      </div>
      
      <div class="thank-you-message">
        <div class="heart">❤️</div>
        <p>您的支持是我持续更新的动力！</p>
      </div>
      
      <div class="action-buttons">
        <el-button 
          type="primary" 
          @click="handleDonated"
          class="donate-button"
        >
          <el-icon><CircleCheck /></el-icon>
          已打赏
        </el-button>
        <el-button 
          @click="handleClose"
          class="close-button"
        >
          下次一定
        </el-button>
      </div>
    </div>
  </el-dialog>
  
  <!-- 浮动打赏按钮 -->
  <div class="floating-donation-button" @click="openDialog" v-if="!dialogVisible">
    <div class="float-icon">
      <span class="coffee">☕</span>
      <span class="text">打赏</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera, CircleCheck } from '@element-plus/icons-vue'

const dialogVisible = ref(false)
const isShaking = ref(false)
const currentTextIndex = ref(0)
const isMobile = ref(false)

// 二维码图片路径（部署时会自动添加 base 路径）
const qrcodeUrl = import.meta.env.BASE_URL + 'qrcode.jpg'

const texts = [
  '☕ 请作者喝杯咖啡',
  '🥤 请作者喝杯奶茶',
  '🍰 请作者吃块蛋糕',
  '🍔 请作者吃个汉堡',
]

const currentText = computed(() => texts[currentTextIndex.value])

let textInterval = null
let shakeInterval = null

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // 文字轮播
  textInterval = setInterval(() => {
    currentTextIndex.value = (currentTextIndex.value + 1) % texts.length
  }, 3000)
  
  // 定期抖动效果
  shakeInterval = setInterval(() => {
    if (dialogVisible.value) {
      isShaking.value = true
      setTimeout(() => {
        isShaking.value = false
      }, 500)
    }
  }, 5000)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (textInterval) clearInterval(textInterval)
  if (shakeInterval) clearInterval(shakeInterval)
})

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const openDialog = () => {
  dialogVisible.value = true
}

const handleClose = () => {
  dialogVisible.value = false
  ElMessage.info('下次一定哦~ 💝')
}

const handleDonated = () => {
  dialogVisible.value = false
  ElMessage.success({
    message: '感谢您的支持！🎉',
    duration: 3000
  })
  // 显示感谢动画
  showConfetti()
}

const handleImageError = (e) => {
  console.error('二维码图片加载失败')
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="14" text-anchor="middle" dy=".3em"%3E二维码加载中...%3C/text%3E%3C/svg%3E'
}

const showConfetti = () => {
  // 简单的感谢动画
  const confettiCount = 50
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      createConfetti()
    }, i * 30)
  }
}

const createConfetti = () => {
  const confetti = document.createElement('div')
  confetti.className = 'confetti'
  confetti.style.left = Math.random() * 100 + 'vw'
  confetti.style.animationDuration = (Math.random() * 3 + 2) + 's'
  confetti.textContent = ['❤️', '💝', '🎉', '✨', '⭐'][Math.floor(Math.random() * 5)]
  document.body.appendChild(confetti)
  
  setTimeout(() => {
    confetti.remove()
  }, 5000)
}
</script>

<style scoped>
.donation-dialog :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.donation-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.donation-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.dialog-header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.coffee-icon {
  font-size: 48px;
  animation: bounce 2s infinite;
  display: inline-block;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.dialog-title {
  margin: 10px 0 0 0;
  font-size: 22px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.donation-content {
  padding: 30px 20px;
}

.message-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 25px;
}

.sparkle {
  font-size: 24px;
  animation: twinkle 1.5s infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.donation-text {
  text-align: center;
  font-size: 16px;
  color: #333;
  line-height: 1.8;
  margin: 0;
}

.highlight {
  color: #f5576c;
  font-weight: bold;
  font-size: 18px;
}

.qrcode-container {
  text-align: center;
  margin: 25px 0;
  transition: transform 0.3s ease;
}

.qrcode-container.shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.qrcode-wrapper {
  position: relative;
  display: inline-block;
  padding: 15px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  transition: transform 0.3s ease;
}

.qrcode-wrapper:hover {
  transform: scale(1.05);
}

.qrcode-image {
  width: 200px;
  height: 200px;
  display: block;
  border-radius: 10px;
}

.scan-line {
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #f5576c, transparent);
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% { top: 15px; }
  100% { top: 215px; }
}

.qrcode-label {
  margin-top: 15px;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.scan-icon {
  font-size: 18px;
  color: #f5576c;
}

.thank-you-message {
  text-align: center;
  margin: 20px 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.heart {
  font-size: 32px;
  animation: heartbeat 1.5s infinite;
  display: inline-block;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.thank-you-message p {
  margin: 10px 0 0 0;
  color: #666;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.donate-button,
.close-button {
  flex: 1;
  height: 44px;
  font-size: 16px;
  border-radius: 22px;
  transition: all 0.3s ease;
}

.donate-button {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  color: white;
  font-weight: bold;
}

.donate-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.close-button:hover {
  transform: translateY(-2px);
}

/* 浮动按钮 */
.floating-donation-button {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 999;
  cursor: pointer;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.float-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
  transition: all 0.3s ease;
}

.float-icon:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.6);
}

.float-icon .coffee {
  font-size: 24px;
  line-height: 1;
}

.float-icon .text {
  font-size: 11px;
  color: white;
  font-weight: bold;
  margin-top: 2px;
}

/* 彩屑动画 */
:global(.confetti) {
  position: fixed;
  top: -10px;
  font-size: 24px;
  animation: fall linear forwards;
  pointer-events: none;
  z-index: 9999;
}

@keyframes fall {
  to {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .dialog-header {
    padding: 15px;
  }
  
  .coffee-icon {
    font-size: 36px;
  }
  
  .dialog-title {
    font-size: 18px;
  }
  
  .donation-content {
    padding: 20px 15px;
  }
  
  .donation-text {
    font-size: 14px;
  }
  
  .highlight {
    font-size: 16px;
  }
  
  .qrcode-image {
    width: 180px;
    height: 180px;
  }
  
  .floating-donation-button {
    bottom: 60px;
    right: 15px;
  }
  
  .float-icon {
    width: 55px;
    height: 55px;
  }
  
  .float-icon .coffee {
    font-size: 20px;
  }
  
  .float-icon .text {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .qrcode-image {
    width: 160px;
    height: 160px;
  }
}
</style>
