<script setup>
import {ref,computed,onMounted} from 'vue'
import { useRoute,useRouter } from 'vue-router';
import api from '@/api';

// 获取歌曲列表
const route=useRoute()
const router=useRouter()
const playlistName=ref('')
const tracks=ref([])
const loading=ref(false)

const playlistId=computed(()=>route.query.id)

const fetchPlayListDetail=async()=>{
    const id=playlistId.value
    if(!id) return
    loading.value=true
    try{
        const res = await api.get('/playlist/detail',{id})
        const detail=res.playlist
        if(detail){
            playlistName.value=detail.name||'未知歌单'
            tracks.value=detail.tracks?.map((t) => ({
                id: t.id,
                name: t.name,
                artist: (t.ar || t.artists || []).map((a) => a.name).join('/'),
                durationMs: t.dt || t.duration || 0,
                album: (t.al || t.album)?.name || '',
            })) || []
        }
    }catch(err){
        console.log('获取歌单失败',err)
    }finally{
        loading.value=false
    }
}

//歌曲时长显示
const formatDuration = (ms) => {
  if (!ms) return '00：00'
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

//歌曲播放,传递歌曲id和歌单id
const handlePlaySong=(id)=>{
    if(!id) return 
    router.push({name:'musicplayer',query:{id,playlistId:playlistId.value}})
}

onMounted(()=>{
    fetchPlayListDetail()
})

</script>

<template>
    <div class="musiclist-page">
        <div class="musiclist-inner">
            <h2 class="title">{{ playlistName || '加载中...' }}</h2>
            <!-- 骨架屏状态 -->
            <div v-if="loading" class="skeleton-container">
                <div v-for="i in 20" :key="i" class="skeleton-item">
                    <span class="skeleton-index">{{ i }}</span>
                    <div class="skeleton-main">
                        <div class="skeleton-name"></div>
                        <div class="skeleton-artist"></div>
                    </div>
                    <div class="skeleton-extra">
                        <div class="skeleton-album"></div>
                        <div class="skeleton-duration"></div>
                    </div>
                </div>
            </div>
            <!-- 空状态 -->
            <div v-else-if="!tracks.length" class="tip">暂无歌曲</div>
            <!-- 实际数据列表 -->
            <ul v-else class="track-list">
                <li
                v-for="(track , index) in tracks"
                class="track-item"
                :key="track.id"
                @click="handlePlaySong(track.id)"
                >
                    <span class="track-index">{{ index+1 }}</span>
                    <div class="track-main">
                        <span class="track-name">{{ track.name }}</span>
                        <span class="track-artist">{{ track.artist }}</span>
                    </div>
                    <div class="track-extra">
                        <span class="track-album">{{ track.album }}</span>
                        <span class="track-duration">{{ formatDuration(track.durationMs) }}</span>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
/* 容器基础样式 */
.musiclist-page {
    padding: 20px;
    background-color: #fff;
}

.musiclist-inner {
    border: 1px solid #d3d3d3;
    border-top: 2px solid #c20c0c; /* 顶部红条 */
}

/* 标题样式 */
.title {
    padding: 10px 20px;
    margin: 0;
    font-size: 20px;
    font-weight: normal;
    border-bottom: 1px solid #ccc;
}

/* 提示文字 */
.tip {
    padding: 30px;
    text-align: center;
    color: #666;
}

/* 列表容器 */
.track-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

/* 每一行的样式 */
.track-item {
    display: flex;
    align-items: center;
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    color: #333;
    cursor: pointer;
}

/* 骨架屏样式 */
.skeleton-container {
    padding: 10px 0;
}

.skeleton-item {
    display: flex;
    align-items: center;
    height: 30px;
    line-height: 30px;
    padding: 0 20px;
    border-bottom: 1px solid #f0f0f0;
}

.skeleton-index {
    width: 50px;
    text-align: center;
    color: #ccc;
    font-size: 12px;
}

.skeleton-main {
    flex: 1;
    display: flex;
    padding-right: 10px;
    gap: 10px;
}

.skeleton-name,
.skeleton-artist,
.skeleton-album,
.skeleton-duration {
    height: 14px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: 2px;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-name {
    flex: 1;
}

.skeleton-artist {
    width: 120px;
}

.skeleton-extra {
    width: 300px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
}

.skeleton-album {
    flex: 1;
}

.skeleton-duration {
    width: 60px;
}

@keyframes skeleton-loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

/* 隔行变色 (斑马纹) */
.track-item:nth-child(even) {
    background-color: #f7f7f7;
}

/* 悬浮高亮 */
.track-item:hover {
    background-color: #eee;
}

/* 索引/编号列 */
.track-index {
    width: 50px;
    text-align: center;
    color: #999;
}

/* 中间容器 (歌曲名 + 歌手) */
.track-main {
    flex: 1;
    display: flex;
    padding-right: 10px;
    overflow: hidden;
}

/* 歌曲名 */
.track-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 10px;
}

/* 歌手 - 固定在右侧 */
.track-artist {
    width: 120px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 右侧容器 (专辑 + 时长) */
.track-extra {
    width: 300px; /* 固定右侧总宽度 */
    display: flex;
    justify-content: space-between;
}

/* 专辑名 */
.track-album {
    flex: 1;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 10px;
}

/* 时长列 */
.track-duration {
    width: 60px;
    color: #999;
    text-align: left;
}

/* 响应式调整：如果屏幕太小，隐藏专辑或调整比例 */
@media (max-width: 768px) {
    .track-extra {
        width: 150px;
    }
    .track-album {
        display: none;
    }
}
</style>