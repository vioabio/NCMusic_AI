<script setup>
/**
 * 懒加载图片组件
 * 
 * 功能：
 * 1. 使用 IntersectionObserver 实现懒加载
 * 2. 支持占位图、加载动画、错误处理
 * 3. 支持渐进式加载（模糊到清晰）
 * 
 * 使用方式：
 * <LazyImage src="https://xxx.jpg" alt="描述" />
 */
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // 图片真实地址
  src: {
    type: String,
    required: true
  },
  // 占位图（可选）
  placeholder: {
    type: String,
    default: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3QgZmlsbD0iI2Y1ZjVmNSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiLz48dGV4dCBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg=='
  },
  // 替代文本
  alt: {
    type: String,
    default: ''
  },
  // 加载延迟（毫秒）
  delay: {
    type: Number,
    default: 0
  },
  // 是否启用渐进式加载
  progressive: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['load', 'error'])

const imageRef = ref(null)
const isLoaded = ref(false)
const isError = ref(false)
const isInView = ref(false)

let observer = null
let loadTimer = null

// 初始化懒加载观察器
const initObserver = () => {
  if (!imageRef.value) return
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isInView.value = true
          // 如果设置了延迟，等待延迟后再加载
          if (props.delay > 0) {
            loadTimer = setTimeout(() => {
              loadImage()
            }, props.delay)
          } else {
            loadImage()
          }
          // 停止观察
          observer.unobserve(entry.target)
        }
      })
    },
    {
      root: null, // 使用视口
      rootMargin: '100px 0px', // 提前 100px 开始加载
      threshold: 0
    }
  )
  
  observer.observe(imageRef.value)
}

// 加载图片
const loadImage = () => {
  if (!imageRef.value) return
  
  const img = new Image()
  
  img.onload = () => {
    isLoaded.value = true
    emit('load')
  }
  
  img.onerror = () => {
    isError.value = true
    emit('error', new Error('图片加载失败'))
  }
  
  // 使用渐进式加载
  if (props.progressive && img.complete) {
    isLoaded.value = true
    emit('load')
  }
  
  img.src = props.src
}

// 清理函数
const cleanup = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (loadTimer) {
    clearTimeout(loadTimer)
    loadTimer = null
  }
}

onMounted(() => {
  initObserver()
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="lazy-image-container" ref="imageRef">
    <!-- 占位图 -->
    <img
      v-if="!isLoaded && !isError"
      :src="placeholder"
      class="lazy-image lazy-placeholder"
      alt=""
      aria-hidden="true"
    />
    
    <!-- 加载中动画 -->
    <div v-if="!isLoaded && !isError" class="lazy-loading">
      <div class="lazy-spinner"></div>
    </div>
    
    <!-- 真实图片 -->
    <img
      v-if="isInView"
      :src="src"
      :class="['lazy-image', 'lazy-real', { 'lazy-loaded': isLoaded }]"
      :alt="alt"
    />
    
    <!-- 错误占位 -->
    <div v-if="isError" class="lazy-error">
      <span class="lazy-error-icon">⚠️</span>
      <span class="lazy-error-text">图片加载失败</span>
    </div>
  </div>
</template>

<style scoped>
.lazy-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #f5f5f5;
}

.lazy-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 占位图样式 */
.lazy-placeholder {
  filter: blur(10px);
  transform: scale(1.1);
  transition: opacity 0.3s ease;
}

/* 真实图片 */
.lazy-real {
  opacity: 0;
  transition: opacity 0.5s ease;
}

.lazy-real.lazy-loaded {
  opacity: 1;
}

/* 渐进式加载效果 */
.lazy-real.lazy-loaded + .lazy-placeholder,
.lazy-placeholder.hidden {
  opacity: 0;
}

/* 加载中动画 */
.lazy-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.lazy-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(194, 12, 12, 0.3);
  border-top-color: #c20c0c;
  border-radius: 50%;
  animation: lazy-spin 0.8s linear infinite;
}

@keyframes lazy-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.lazy-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #999;
}

.lazy-error-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.lazy-error-text {
  font-size: 12px;
}
</style>
