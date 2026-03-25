<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from './stores/user'
import api from './api/index'


//全局状态管理，路由跳转
const userStore = useUserStore()
const router = useRouter()

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

const handleAvatarClick = () => {
  console.log('点击了头像')
}
const handleLogout = () => {
  userStore.clearUser()
  router.push('/')
}

// 回到顶部功能
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 平滑滚动
  })
}

// 生成今日歌曲排行榜
const hotSingers=ref([])

const fetchHotSingers=async()=>{
    const res = await api.get('/top/artists',{limit:10})
    hotSingers.value=(res.artists || []).map((item)=>({
      name:item.name,
      pic:item.picUrl,
      id:item.id
    }))
}

const handleClickSingerDetals =(id)=>{
  if(!id) return
  router.push({name:'singerdetails',query:{id}})
}

// 节流后的点击函数（1秒内只能点击一次）
const handleSingerClickThrottled = throttle(handleClickSingerDetals, 1000)

// 意见反馈
import FeedbackModal from '../src/components/FeedbackModal.vue';

const feedbackModalRef = ref(null);

const handleOpenFeedback = () => {
  feedbackModalRef.value.open();
};

// 客户端下载
import DownloadModal from '../src/components/DownloadModal.vue'

const downloadModalRef = ref(null);
const handleOpenDownload = () => {
  downloadModalRef.value.open();
};

onMounted(()=>{
  fetchHotSingers()
})

</script>

<template>
  <div class="grid-layout">
    <!-- 主界面采用grid布局 -->
    <header class="top-nav">
      <!-- 头部导航栏：logo/用户登录 -->
      <div class="top-nav-logo">
        <img src="./assets/img/logo.jpg" alt="网易云音乐" class="logo-img" width="50px" height="50px">
        <span class="top-nav-logo-text">网易云音乐</span>
      </div>
      <!-- 主功能界面 -->
      <div class="top-nav-links">
        <router-link to="/" class="top-nav-link" >音乐馆</router-link>
        <router-link to="/mymusic" class="top-nav-link">我的音乐</router-link>
      </div>
      <!-- 搜索框：使用ladash库中的_.debounce函数添加防抖 -->
      <div class="top-nav-search">
        <input type="text" class="searchmusic" v-model="searchkeyword" @keyup.enter="doSearch" placeholder="搜索音乐/歌手/歌单">
      </div>
      <div class="top-nav-login">
        <router-link v-if="!userStore.isLoggedIn" to="/login" class="login"
            >登录界面</router-link
          >
          <div v-else class="user-menu">
            <button class="user-avatar" type="button" @click="handleAvatarClick">
              <img :src="userStore.user?.avatar" alt="用户头像" />
            </button>
            <div class="user-dropdown">
              <div class="user-dropdown-header">
                <span class="user-name">{{ userStore.user?.nickname || '我的账号' }}</span>
              </div>
              <button class="user-dropdown-item" type="button" @click="handleLogout">
                退出登录
              </button>
            </div>
          </div>
      </div>
    </header>
    <aside class="left-sidebar">
      <!-- 创建左侧边栏：添加AI助手/当日排行榜 -->
      <div class="left-sidebar-link">
        热门歌手排行榜
      </div>
      <div class="left-sidebar-link">
        <div class="hotsinger">
          <ul class="hotsinger-inner">
            <li
            v-for="(item,index) in hotSingers"
            :key="index"
            class="hotsinger-list"
            @click="handleSingerClickThrottled(item.id)"
            >
            <span class="hotsinger-index">{{ index+1 }}</span>
            <img :src="item.pic" :alt="歌手头像" class="hotsinger-pic">
            <span class="hotsinger-name">{{ item.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </aside>
    <aside class="right-sidebar">
      <!-- 创建右侧边栏：添加意见反馈和回到顶部 -->
      <div class="right-sidebar-link" @click="handleOpenDownload">
        下载客户端
      </div>
      <download-modal ref="downloadModalRef"></download-modal>
      <div class="right-sidebar-link" @click="handleOpenFeedback">
        意见反馈
      </div>
      <feedback-modal ref="feedbackModalRef"></feedback-modal>
      <div class="right-sidebar-link" @click="scrollToTop">
        回到顶部
      </div>
    </aside>
    <main class="main-content">
      <!-- 创建路由跳转子界面：显示界面内容 -->
      <router-view></router-view>
    </main>

    <!-- 页脚部分内容 -->
    <footer class="footer">
      <div class="footer-content">
        <!-- 网页链接部分 -->
        <div class="footer-links">
          <a href="#">服务条款</a><span class="line">|</span>
          <a href="#">隐私政策</a><span class="line">|</span>
          <a href="#">儿童隐私政策</a><span class="line">|</span>
          <a href="#">版权投诉</a><span class="line">|</span>
          <a href="#">投资者关系</a><span class="line">|</span> 
          <a href="#">广告合作</a><span class="line">|</span>
          <a href="#">联系我们</a>
        </div>

        <!-- 底部版权信息区域 -->
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
            网易公司版权所有©1997-2026  杭州乐读科技有限公司运营：浙网文[2024] 0900-042号 
            <span class="police-icon"></span> 浙公网安备 33010802013307号  算法服务公示信息
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import './css/app.css';

</style>
