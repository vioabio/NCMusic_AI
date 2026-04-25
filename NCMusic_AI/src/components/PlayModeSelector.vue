<script setup>
import { Sort, Eleme, RefreshRight, RefreshLeft, Check } from '@element-plus/icons-vue'

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'close'])

const modes = [
  { id: 0, name: '顺序播放', icon: Sort, desc: '按列表顺序依次播放' },
  { id: 1, name: '随机播放', icon: Eleme, desc: '随机打乱顺序播放' },
  { id: 2, name: '单曲循环', icon: RefreshRight, desc: '当前歌曲重复播放' },
  { id: 3, name: '列表循环', icon: RefreshLeft, desc: '播放完列表后重新开始' }
]

const handleSelectMode = (modeId) => {
  emit('update:modelValue', modeId)
  emit('update:visible', false)
  emit('close')
}

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">播放模式</h3>
            <button class="modal-close" @click="handleClose">×</button>
          </div>
          <div class="modal-body">
            <div
              v-for="mode in modes"
              :key="mode.id"
              class="mode-item"
              :class="{ 'mode-item--active': modelValue === mode.id }"
              @click="handleSelectMode(mode.id)"
            >
              <div class="mode-icon">
                <el-icon :size="20"><component :is="mode.icon" /></el-icon>
              </div>
              <div class="mode-info">
                <div class="mode-name">{{ mode.name }}</div>
                <div class="mode-desc">{{ mode.desc }}</div>
              </div>
              <div v-if="modelValue === mode.id" class="mode-check">
                <el-icon :size="20" color="#26ce8a"><Check /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #4b1a26 0%, #210a10 100%);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mode-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.mode-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.mode-item--active {
  background: rgba(38, 206, 138, 0.15);
  border-color: #26ce8a;
}

.mode-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin-right: 14px;
  color: #fff;
  transition: all 0.2s;
}

.mode-item:hover .mode-icon {
  background: rgba(255, 255, 255, 0.2);
}

.mode-item--active .mode-icon {
  background: rgba(38, 206, 138, 0.25);
  color: #26ce8a;
}

.mode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mode-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  line-height: 1.4;
}

.mode-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
}

.mode-item--active .mode-name {
  color: #26ce8a;
}

.mode-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: scale(0.9) translateY(-20px);
}
</style>
