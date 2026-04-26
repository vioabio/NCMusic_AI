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

const createPetal = () => {
  const container = document.querySelector('.petals-container')
  if (!container) return

  const petal = document.createElement('div')
  petal.className = 'petal'
  petal.innerHTML = '❀'

  const size = Math.random() * 15 + 10
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
    color: #ffb7c5;
    opacity: ${opacity};
    pointer-events: none;
    z-index: 1;
    will-change: transform, opacity;
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

    petal.style.transform = `translateX(${currentX - startLeft}px) rotate(${rotate}deg)`
    petal.style.top = `${currentY}px`

    if (progress < 0.1) {
      petal.style.opacity = (opacity * progress * 10).toString()
    } else if (progress > 0.9) {
      petal.style.opacity = (opacity * (1 - progress) * 10).toString()
    }

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      petal.remove()
    }
  }

  requestAnimationFrame(animate)
}

let petalInterval = null

const startPetalAnimation = () => {
  stopPetalAnimation()
  const interval = Math.max(100, 300 - (props.speed - 1) * 30)
  petalInterval = setInterval(createPetal, interval)
}

const stopPetalAnimation = () => {
  if (petalInterval) {
    clearInterval(petalInterval)
    petalInterval = null
  }
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  startPetalAnimation()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  stopPetalAnimation()
})

watch(() => props.speed, () => {
  startPetalAnimation()
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
