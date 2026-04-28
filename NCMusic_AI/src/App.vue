<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from './stores/user'
import api from './api/index'
import { ElInput, ElButton, ElAvatar, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus'
import { ArrowUp, Download, Service,Search } from '@element-plus/icons-vue'

//全局状态管理，路由跳转
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 是否显示导航栏（壁纸页面和音乐播放器页面不显示）
const showNav = ref(true)
watch(() => route.name, (name) => {
  showNav.value = name !== 'wallpaper' && name !== 'musicplayer'
}, { immediate: true })

const searchkeyword = ref('')

// 防抖函数
const debounce = (fn, delay) => {
  let timer = null
  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流函数
const throttle = (fn, delay) => {
  let lastTime = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

// 实际搜索逻辑
const doSearch = () => {
  const keyword = searchkeyword.value.trim()
  if (!keyword) return
  router.push({
    name: 'musicsearch',
    query: {
      keyword,
    },
  })
}

// 防抖后的搜索函数（500ms延迟）
const handleSearch = debounce(doSearch, 500)

// 监听输入变化，自动触发防抖搜索
watch(searchkeyword, () => {
  handleSearch()
})

const handleLogout = () => {
  userStore.clearUser()
  router.push('/')
}

// 回到顶部功能
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 生成今日歌曲排行榜
const hotSingers = ref([])

const fetchHotSingers = async () => {
  const res = await api.get('/top/artists', { limit: 10 })
  hotSingers.value = (res.artists || []).map((item) => ({
    name: item.name,
    pic: item.picUrl,
    id: item.id
  }))
}

const handleClickSingerDetals = (id) => {
  if (!id) return
  router.push({ name: 'singerdetails', query: { id } })
}

// 节流后的点击函数（1秒内只能点击一次）
const handleSingerClickThrottled = throttle(handleClickSingerDetals, 1000)

// 意见反馈
import FeedbackModal from '../src/components/FeedbackModal.vue'
const feedbackModalRef = ref(null)
const handleOpenFeedback = () => {
  feedbackModalRef.value.open()
}

// 客户端下载
import DownloadModal from '../src/components/DownloadModal.vue'
const downloadModalRef = ref(null)
const handleOpenDownload = () => {
  downloadModalRef.value.open()
}

onMounted(() => {
  fetchHotSingers()
})
</script>

<template>
  <div class="grid-layout" :class="{ 'hide-sidebar': !showNav }">
    <!-- 头部导航栏 -->
    <header class="top-nav" v-if="showNav">
      <div class="top-nav-logo" @click="router.push('/musichall')">
        <img src="./assets/img/logo.jpg" alt="网易云音乐" class="logo-img">
        <span class="top-nav-logo-text">网易云音乐</span>
      </div>
      <div class="top-nav-links">
        <router-link to="/musichall" class="top-nav-link">音乐馆</router-link>
        <router-link to="/mymusic" class="top-nav-link">我的音乐</router-link>
      </div>
      <div class="top-nav-search">
        <el-input
          v-model="searchkeyword"
          placeholder="搜索音乐/歌手/歌单"
          @keyup.enter="doSearch"
          clearable
          class="search-input"
          :prefix-icon="Search"
        />
      </div>
      <div class="top-nav-login">
        <el-button v-if="!userStore.isLoggedIn" type="primary" @click="router.push('/login')">
          登录
        </el-button>
        <el-dropdown v-else trigger="click">
          <el-avatar :src="userStore.user?.avatar" :size="35" class="user-avatar" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>{{ userStore.user?.nickname || '我的账号' }}</el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 左侧边栏 -->
    <aside class="left-sidebar" v-if="showNav">
      <div class="left-sidebar-link">
        热门歌手排行榜
      </div>
      <div class="left-sidebar-link">
        <div class="hotsinger">
          <ul class="hotsinger-inner">
            <li
              v-for="(item, index) in hotSingers"
              :key="item.id"
              class="hotsinger-list"
              @click="handleSingerClickThrottled(item.id)"
            >
              <span class="hotsinger-index">{{ index + 1 }}</span>
              <img :src="item.pic" alt="歌手头像" class="hotsinger-pic">
              <span class="hotsinger-name">{{ item.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </aside>

    <!-- 右侧边栏 -->
    <aside class="right-sidebar" v-if="showNav">
      <div class="right-sidebar-buttons">
        <el-button type="default" class="right-sidebar-btn" @click="handleOpenDownload">
          <el-icon><Download /></el-icon> 下载客户端
        </el-button>
        <el-button type="default" class="right-sidebar-btn" @click="handleOpenFeedback">
          <el-icon><Service /></el-icon> 意见反馈
        </el-button>
        <el-button type="default" class="right-sidebar-btn" @click="scrollToTop">
          <el-icon><ArrowUp /></el-icon> 回到顶部
        </el-button>
      </div>
      <download-modal ref="downloadModalRef" />
      <feedback-modal ref="feedbackModalRef" />
    </aside>

    <!-- 主内容区 -->
    <main class="main-content" :class="{ 'full-width': !showNav }">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="footer" v-if="showNav">
      <div class="footer-content">
        <div class="footer-links">
          <a href="#">服务条款</a><span class="line">|</span>
          <a href="#">隐私政策</a><span class="line">|</span>
          <a href="#">儿童隐私政策</a><span class="line">|</span>
          <a href="#">版权投诉</a><span class="line">|</span>
          <a href="#">投资者关系</a><span class="line">|</span>
          <a href="#">广告合作</a><span class="line">|</span>
          <a href="#">联系我们</a>
        </div>
        <div class="footer-info">
          <p>
            <span>廉正举报</span>
            <span class="margin-left">不良信息举报邮箱：51jubao@service.netease.com</span>
          </p>
          <p>
            互联网宗教信息服务许可证：浙（2022）0000120 增值电信业务经营许可证：浙B2-20150198
            粤B2-20090191-18 浙ICP备15006616号-4 工业和信息化部备案管理系统网站
          </p>
          <p>
            网易公司版权所有©1997-2026 杭州乐读科技有限公司运营：浙网文[2024] 0900-042号
            <span class="police-icon"></span> 浙公网安备 33010802013307号 算法服务公示信息
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import './css/app.css';

/* 壁纸页面隐藏侧边栏时，主内容区全屏 */
.hide-sidebar .main-content.full-width {
  grid-column: 1 / -1;
  width: 100%;
  padding: 0;
  background: transparent;
}

/* Element Plus 组件样式覆盖 */
.search-input :deep(.el-input__wrapper) {
  border-radius: 32px;
}

.top-nav-search :deep(.el-input__inner) {
  height: 32px;
}

/* 右侧边栏按钮样式 - 沿用 .right-sidebar-link 风格 */
.right-sidebar {
  grid-area: right;
  background-color: #f9f9f9;
  border-left: 1px solid #ddd;
  padding: 20px;
  margin-top: 30px;
  margin-bottom: 20px;
  position: sticky;
  top: 80px;
  height: calc(100vh - 110px);
  overflow-y: auto;
  align-self: start;
}

.right-sidebar-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.right-sidebar-btn {
  width: 100%;
  /* 核心修复：盒模型包含边框/内边，不会超出容器宽度 */
  box-sizing: border-box;
  border: 1px solid #ccc;
  background: #fff;
  color: #333;
  font-size: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s;
  margin: 0 !important;
}

.right-sidebar-btn:hover {
  border-color: #C20C0C;
  color: #C20C0C;
}
</style>
