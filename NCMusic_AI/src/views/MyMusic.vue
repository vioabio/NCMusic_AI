<script setup>
import {ref,onMounted } from 'vue'
import api  from '@/api'
import {useUserStore} from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElButton, ElCard, ElEmpty } from 'element-plus'

const userStore=useUserStore()
const router=useRouter()

const playlists=ref([])

// 网络请求，获取用户歌单
const fetchUserPlaylists = async () =>{
    const uid = userStore.user?.id
    if(!uid) return
    try{
        const res = await api.get("/user/playlist",{ uid })
        playlists.value = res.playlist?.map((item) =>({
        id:item.id,
        name:item.name,
        cover:item.coverImgUrl,
        trackCount:item.trackCount
    })) || []
    }catch(err){
        console.log("获取用户歌单失败:",err);
    }
}

onMounted(()=>{
    fetchUserPlaylists()
})

const handleGoLogin=()=>{
    router.push('/login')
}

const handleOpenPlayList=(id)=>{
    if(!id) return
    router.push({name:'musiclist',query:{id}})
}
</script>

<template>
  <div class="mymusic-page">
    <div class="mymusic-inner">
      <h2 class="title">我的音乐</h2>
      <!-- 判断用户是否登录 -->
      <div v-if="!userStore.isLoggedIn" class="login-hint">
        <p class="hint-text">您还未登录，请先登录后查看个人歌单</p>
        <el-button type="danger" class="hint-btn" @click="handleGoLogin" round>去登录</el-button>
      </div>
      <div v-else>
        <p class="subtitle">我的歌单</p>
        <div v-if="!playlists.length" class="tip">
          <el-empty description="暂无歌单，快去收藏一些音乐吧！" />
        </div>
        <ul v-else class="playlist-list">
            <li
                v-for="item in playlists" 
                :key="item.id"
                class="playlist-item"
                @click="handleOpenPlayList(item.id)"
            >
            <el-card class="cover" :body-style="{ padding: '0' }" shadow="hover">
                <img :src="item.cover" alt="">
            </el-card>
            <div class="info">
                <p class="name">{{ item.name }}</p>
                <p class="desc">共{{ item.trackCount }}首</p>
            </div>
            </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mymusic-page {
  padding: 40px 10%;
  background-color: #fff;
  min-height: 100vh;
}

.mymusic-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
}

.subtitle {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

/* 登录提示样式 */
.login-hint {
  text-align: center;
  padding: 50px 0;
}
.hint-text {
  color: #666;
  margin-bottom: 20px;
}
.hint-btn {
  padding: 8px 30px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 20px;
}

.hint-btn:hover {
  background-color: #f56c6c;
  color: white;
}

/* 歌单列表 - 网格布局 */
.playlist-list {
  display: grid;
  /* 强制一行4列，间距20px */
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  list-style: none;
  padding: 0;
}

/* 歌单卡片项 */
.playlist-item {
  cursor: pointer;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.playlist-item:hover {
  transform: translateY(-5px);
}

/* 封面图容器 */
.cover {
  width: 100%;
  aspect-ratio: 1 / 1; /* 保持正方形 */
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  border: none;
}

.cover :deep(.el-card__body) {
  width: 100%;
  height: 100%;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 文字信息区 */
.info {
  padding: 12px 4px;
}

.name {
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
  /* 标题过长省略号 */
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.desc {
  font-size: 12px;
  color: #999;
}

.tip {
  color: #999;
  text-align: center;
  margin-top: 50px;
}

/* 移动端适配：如果是小屏幕自动切换为2列 */
@media (max-width: 768px) {
  .playlist-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>