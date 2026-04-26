<template>
  <!-- v-model 控制显示隐藏 -->
  <el-dialog
    title="下载客户端"
    v-model="visible"
    width="500px"
    @closed="handleClosed"
    :close-on-click-modal="true"
    :z-index="9999"
    append-to-body
  >
    <div class="download-container">
      <h3>选择下载平台</h3>
      <p class="download-desc">请选择适合您设备的客户端版本：</p>

      <!-- 下载选项列表 -->
      <div class="download-options">
        <div class="download-item" @click="downloadApp('windows')">
          <div class="download-icon">
            <img src="../assets/img/icon_svg/windows-legacy-svgrepo-com.svg" alt="Windows" class="platform-icon" />
          </div>
          <div class="download-info">
            <h4>Windows 版</h4>
            <p class="version">版本 2.3.5</p>
            <p class="size">大小: 85 MB</p>
          </div>
          <button class="download-btn">
            <span class="btn-text">立即下载</span>
          </button>
        </div>

        <div class="download-item" @click="downloadApp('mac')">
          <div class="download-icon">
            <img src="../assets/img/icon_svg/mac-svgrepo-com.svg" alt="Mac" class="platform-icon" />
          </div>
          <div class="download-info">
            <h4>Mac 版</h4>
            <p class="version">版本 2.3.5</p>
            <p class="size">大小: 92 MB</p>
          </div>
          <button class="download-btn">
            <span class="btn-text">立即下载</span>
          </button>
        </div>

        <div class="download-item" @click="downloadApp('android')">
          <div class="download-icon">
            <img src="../assets/img/icon_svg/android-color-svgrepo-com.svg" alt="Android" class="platform-icon" />
          </div>
          <div class="download-info">
            <h4>Android 版</h4>
            <p class="version">版本 8.2.1</p>
            <p class="size">大小: 68 MB</p>
          </div>
          <button class="download-btn">
            <span class="btn-text">立即下载</span>
          </button>
        </div>
      </div>

      <!-- 底部提示 -->
      <div class="download-tips">
        <p>💡 下载后请先阅读《用户协议》和《隐私政策》</p>
        <p>📱 扫描二维码下载移动版应用</p>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineExpose } from 'vue';
import { ElMessage } from 'element-plus';

const visible = ref(false);

// 暴露给父组件的方法：打开弹窗
const open = () => {
  visible.value = true;
};

// 下载功能
const downloadApp = (platform) => {
  // 模拟下载链接
  const downloadUrls = {
    windows: 'https://music.163.com/#/download',
    mac: 'https://music.163.com/#/download',
    ios: 'https://apps.apple.com/cn/app/wang-yi-yun-yin-le/id590338362',
    android: 'https://music.163.com/#/download'
  };

  // 显示下载提示
  ElMessage.success(`正在跳转到 ${platform.toUpperCase()} 版下载页面...`);
  
  // 模拟延迟后跳转（实际开发中可以使用 window.open 直接跳转）
  setTimeout(() => {
    console.log(`下载 ${platform} 版本:`, downloadUrls[platform]);
    // window.open(downloadUrls[platform], '_blank');
  }, 500);
};

// 弹窗关闭后的回调
const handleClosed = () => {
  console.log('下载弹窗已关闭');
};

// 使用 defineExpose 暴露方法给外部
defineExpose({ open });
</script>

<style scoped>
.download-container {
  padding: 10px 0;
}

.download-container h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.download-desc {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.download-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.download-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
}

.download-item:hover {
  border-color: #C20C0C;
  background-color: #fff8f8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(194, 12, 12, 0.1);
}

.download-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.platform-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.download-info {
  flex: 1;
}

.download-info h4 {
  margin: 0 0 5px 0;
  font-size: 15px;
  color: #333;
  font-weight: 600;
}

.download-info .version,
.download-info .size {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.download-btn {
  padding: 8px 20px;
  background-color: #C20C0C;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.download-item:hover .download-btn {
  background-color: #ff4757;
  transform: scale(1.05);
}

.download-tips {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff8f8;
  border-left: 3px solid #C20C0C;
  border-radius: 4px;
}

.download-tips p {
  margin: 5px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
