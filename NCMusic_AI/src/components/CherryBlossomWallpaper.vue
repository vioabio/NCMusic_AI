<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const emit = defineEmits(['click'])

const props = defineProps({
  bgImage: {
    type: String,
    default: ''
  },
  speed: {
    type: Number,
    default: 3
  }
})

const handleClick = (e) => {
  emit('click', e)
}

const currentTime = ref('')
const currentDate = ref('')
let timer = null

const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const updateTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDay = weekDays[now.getDay()]
  currentDate.value = `${year}.${month}.${day} ${weekDay}`
}

const particleTypes = [
  { symbol: '❀', color: '#ffb7c5', sizeRange: [10, 18] },  // 樱花
  { symbol: '🌸', color: '#ffc0cb', sizeRange: [12, 20] },  // 樱花emoji
  { symbol: '🍃', color: '#98fb98', sizeRange: [10, 16] },  // 绿叶
  { symbol: '✿', color: '#ffdab9', sizeRange: [8, 14] },   // 小花的
]

const featherTypes = [
  { symbol: '🪶', color: '#fffaf0', sizeRange: [14, 22] },  // 羽毛
  { symbol: '·', color: '#ffffff', sizeRange: [4, 8] },     // 光点
]

const createPetal = () => {
  const container = document.querySelector('.petals-container')
  if (!container) return

  const type = particleTypes[Math.floor(Math.random() * particleTypes.length)]
  const petal = document.createElement('div')
  petal.className = 'petal fall-petal'
  petal.innerHTML = type.symbol

  const size = Math.random() * (type.sizeRange[1] - type.sizeRange[0]) + type.sizeRange[0]
  const startX = Math.random() * window.innerWidth
  const fallDuration = (Math.random() * 5 + props.speed) * 1000
  const opacity = Math.random() * 0.5 + 0.3
  const rotateDirection = Math.random() > 0.5 ? 1 : -1
  const drift = (Math.random() - 0.5) * 200

  petal.style.cssText = `
    position: fixed;
    top: -30px;
    left: ${startX}px;
    font-size: ${size}px;
    color: ${type.color};
    opacity: 0;
    pointer-events: none;
    z-index: 1;
    will-change: transform, opacity;
    filter: blur(${Math.random() * 0.5}px);
  `

  container.appendChild(petal)

  const startTime = Date.now()
  const startLeft = parseFloat(petal.style.left)
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / fallDuration, 1)

    const currentY = progress * (window.innerHeight + 30)
    const currentX = startLeft + (drift * progress)
    const rotate = progress * 360 * rotateDirection
    const sway = Math.sin(progress * Math.PI * 3) * 30

    petal.style.transform = `translateX(${currentX - startLeft + sway}px) rotate(${rotate}deg)`
    petal.style.top = `${currentY}px`

    // 淡入淡出
    if (progress < 0.1) {
      petal.style.opacity = (opacity * progress * 10).toString()
    } else if (progress > 0.9) {
      petal.style.opacity = (opacity * (1 - progress) * 10).toString()
    } else {
      petal.style.opacity = opacity.toString()
    }

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      petal.remove()
    }
  }

  requestAnimationFrame(animate)
}

// 创建从右向左飘散的羽毛/花瓣（微风吹拂效果）
const createBreeze = () => {
  const container = document.querySelector('.petals-container')
  if (!container) return

  const useFeather = Math.random() > 0.5
  const types = useFeather ? featherTypes : particleTypes
  const type = types[Math.floor(Math.random() * types.length)]
  
  const particle = document.createElement('div')
  particle.className = 'petal breeze-petal'
  particle.innerHTML = type.symbol

  const size = Math.random() * (type.sizeRange[1] - type.sizeRange[0]) + type.sizeRange[0]
  const startY = Math.random() * window.innerHeight * 0.7
  const duration = (Math.random() * 4 + 3) * 1000
  const opacity = Math.random() * 0.4 + 0.2
  const rotate = Math.random() * 360

  particle.style.cssText = `
    position: fixed;
    top: ${startY}px;
    right: -30px;
    font-size: ${size}px;
    color: ${type.color};
    opacity: 0;
    pointer-events: none;
    z-index: 1;
    will-change: transform, opacity;
    filter: blur(${Math.random() * 0.3}px);
  `

  container.appendChild(particle)

  const startTime = Date.now()
  const startTop = parseFloat(particle.style.top)
  const driftY = (Math.random() - 0.5) * 150

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    const currentX = progress * (window.innerWidth + 60)
    const currentY = startTop + (driftY * progress)
    const currentRotate = rotate + progress * 180 * (Math.random() > 0.5 ? 1 : -1)

    particle.style.transform = `translateX(${-currentX}px) translateY(${currentY - startTop}px) rotate(${currentRotate}deg)`
    particle.style.top = `${currentY}px`

    // 淡入淡出
    if (progress < 0.15) {
      particle.style.opacity = (opacity * progress / 0.15).toString()
    } else if (progress > 0.85) {
      particle.style.opacity = (opacity * (1 - progress) / 0.15).toString()
    } else {
      particle.style.opacity = opacity.toString()
    }

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      particle.remove()
    }
  }

  requestAnimationFrame(animate)
}

// 创建随风飘散的光点/羽毛（随机飘散效果）
const createFloating = () => {
  const container = document.querySelector('.petals-container')
  if (!container) return

  const type = featherTypes[Math.floor(Math.random() * featherTypes.length)]
  const particle = document.createElement('div')
  particle.className = 'petal floating-petal'
  particle.innerHTML = type.symbol

  const size = Math.random() * (type.sizeRange[1] - type.sizeRange[0]) + type.sizeRange[0]
  const startX = Math.random() * window.innerWidth
  const startY = Math.random() * window.innerHeight
  const duration = (Math.random() * 8 + 6) * 1000
  const opacity = Math.random() * 0.3 + 0.1

  particle.style.cssText = `
    position: fixed;
    top: ${startY}px;
    left: ${startX}px;
    font-size: ${size}px;
    color: ${type.color};
    opacity: 0;
    pointer-events: none;
    z-index: 1;
    will-change: transform, opacity;
    filter: blur(${Math.random() * 1}px);
  `

  container.appendChild(particle)

  const startTime = Date.now()
  const startLeft = parseFloat(particle.style.left)
  const startTop = parseFloat(particle.style.top)

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 复杂的飘散路径：左右上下随机漂移
    const driftX = Math.sin(progress * Math.PI * 4) * 100 + (Math.random() - 0.5) * 50
    const driftY = Math.sin(progress * Math.PI * 2) * 80 - progress * 100
    const rotate = progress * 720 * (Math.random() > 0.5 ? 1 : -1)
    const scale = 0.8 + Math.sin(progress * Math.PI * 3) * 0.2

    particle.style.transform = `translateX(${driftX}px) translateY(${driftY}px) rotate(${rotate}deg) scale(${scale})`
    particle.style.left = `${startLeft}px`
    particle.style.top = `${startTop}px`

    // 呼吸式透明度
    if (progress < 0.1) {
      particle.style.opacity = (opacity * progress * 10).toString()
    } else if (progress > 0.9) {
      particle.style.opacity = (opacity * (1 - progress) * 10).toString()
    } else {
      particle.style.opacity = (opacity * (0.8 + Math.sin(progress * Math.PI * 4) * 0.2)).toString()
    }

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      particle.remove()
    }
  }

  requestAnimationFrame(animate)
}

// 主动画循环
let fallInterval = null
let breezeInterval = null
let floatingInterval = null

const startAllAnimations = () => {
  stopAllAnimations()
  
  // 下落花瓣
  const fallIntervalTime = Math.max(150, 400 - (props.speed - 1) * 40)
  fallInterval = setInterval(createPetal, fallIntervalTime)
  
  // 微风吹拂（从右向左）
  const breezeIntervalTime = Math.max(300, 600 - (props.speed - 1) * 50)
  breezeInterval = setInterval(createBreeze, breezeIntervalTime)
  
  // 飘散光点/羽毛
  const floatingIntervalTime = Math.max(500, 1000 - (props.speed - 1) * 80)
  floatingInterval = setInterval(createFloating, floatingIntervalTime)
}

const stopAllAnimations = () => {
  if (fallInterval) {
    clearInterval(fallInterval)
    fallInterval = null
  }
  if (breezeInterval) {
    clearInterval(breezeInterval)
    breezeInterval = null
  }
  if (floatingInterval) {
    clearInterval(floatingInterval)
    floatingInterval = null
  }
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  startAllAnimations()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  stopAllAnimations()
  // 清理所有残留粒子
  const container = document.querySelector('.petals-container')
  if (container) {
    container.innerHTML = ''
  }
})

watch(() => props.speed, () => {
  startAllAnimations()
})
</script>

<template>
  <div class="wallpaper-container" @click="handleClick">
    <div
      class="bg-image"
      :style="bgImage ? { backgroundImage: `url(${bgImage})` } : {}"
    ></div>
    <div class="overlay"></div>
    <div class="petals-container"></div>
    <div class="time-display">
      <div class="time-text">{{ currentTime }}</div>
      <div class="date-text">{{ currentDate }}</div>
    </div>
    <div class="content-slot">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.wallpaper-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 0;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #1a1a2e;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.petals-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.time-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  text-align: center;
  user-select: none;
}

.time-text {
  font-size: 120px;
  font-weight: 200;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 8px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  line-height: 1;
}

.date-text {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 20px;
  letter-spacing: 4px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.content-slot {
  position: relative;
  z-index: 4;
  width: 100%;
  height: 100%;
}
</style>
