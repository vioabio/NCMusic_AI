/**
 * 自定义 Vue 指令：v-lazyload
 * 使用 IntersectionObserver 实现图片懒加载
 * 
 * 使用方式：
 * <img v-lazyload="imageUrl" alt="图片">
 * 
 * 特性：
 * 1. 支持占位图（加载中显示）
 * 2. 支持加载失败处理
 * 3. 支持渐进式加载（模糊->清晰）
 * 4. 自动销毁 observer，避免内存泄漏
 */
import { ref, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'v-lazyload',
  
  mounted(el, binding) {
    // 初始化观察器
    setupObserver(el, binding)
  },
  
  updated(el, binding) {
    // 当图片 URL 变化时，重新设置
    if (binding.value !== binding.oldValue) {
      el.src = binding.arg?.placeholder || 'data:image/svg+xml;base64,...'
      if (el._observer) {
        el._observer.observe(el)
      }
    }
  },
  
  unmounted(el) {
    // 清理观察器，防止内存泄漏
    if (el._observer) {
      el._observer.disconnect()
      delete el._observer
    }
  }
}

function setupObserver(el, binding) {
  const lazyImageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lazyImage = entry.target
        const src = binding.value
        
        // 添加加载完成监听
        lazyImage.onload = () => {
          lazyImage.classList.add('lazyloaded')
          lazyImage.classList.remove('lazyloading')
        }
        
        // 添加加载失败处理
        lazyImage.onerror = () => {
          lazyImage.classList.add('lazy-error')
          lazyImage.classList.remove('lazyloading')
          console.warn(`图片加载失败: ${src}`)
        }
        
        // 开始加载真实图片
        lazyImage.src = src
        lazyImage.classList.add('lazyloading')
        
        // 停止观察已加载的图片
        observer.unobserve(lazyImage)
      }
    })
  }, {
    root: null,                    // 视口
    rootMargin: '50px 0px',       // 提前 50px 开始加载
    threshold: 0                  // 只要出现就开始加载
  })
  
  // 保存 observer 引用
  el._observer = lazyImageObserver
  
  // 开始观察
  lazyImageObserver.observe(el)
}

// 组合式 API 版本（更推荐）
export function useLazyLoad() {
  const imageRef = ref(null)
  const isLoaded = ref(false)
  const isError = ref(false)
  let observer = null
  
  const initLazyLoad = (imageUrl) => {
    if (!imageRef.value) return
    
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          
          img.onload = () => {
            isLoaded.value = true
          }
          
          img.onerror = () => {
            isError.value = true
          }
          
          img.src = imageUrl
          observer.unobserve(img)
        }
      })
    }, {
      rootMargin: '100px 0px',
      threshold: 0
    })
    
    observer.observe(imageRef.value)
  }
  
  const destroy = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }
  
  onUnmounted(destroy)
  
  return {
    imageRef,
    isLoaded,
    isError,
    initLazyLoad
  }
}
