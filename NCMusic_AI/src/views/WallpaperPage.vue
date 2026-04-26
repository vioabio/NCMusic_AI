<script setup>
import { useRouter } from 'vue-router'
import CherryBlossomWallpaper from '../components/CherryBlossomWallpaper.vue'
import mikuBg from '../assets/img/miku/miku_1.jpg'
import { onMounted } from 'vue'

const router = useRouter()

// 预加载音乐馆相关组件
onMounted(() => {
  // 触发路由组件提前加载（Vite 会打包为独立 chunk，import() 会触发网络请求缓存）
  import('../views/MusicHall.vue')
  import('../components/PlayModeSelector.vue')
})

const enterSite = () => {
  router.push('/musichall')
}
</script>

<template>
  <CherryBlossomWallpaper :bgImage="mikuBg" :speed="3" @click="enterSite">
    <div class="enter-hint">
      <span>开始我的音乐之旅</span>
    </div>
  </CherryBlossomWallpaper>
</template>

<style scoped>
.enter-hint {
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  letter-spacing: 2px;
  animation: pulse 2s ease-in-out infinite;
  z-index: 10;
  cursor: pointer;
  user-select: none;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}
</style>
