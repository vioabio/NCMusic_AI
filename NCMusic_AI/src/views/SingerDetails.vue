<script setup>
import { useRoute } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';
import api from '../api/index';

const route = useRoute()
const singerId = computed(() => route.query.id)

// 响应式数据
const singerdetails = ref([])
const simSingers = ref([])
const singersongs = ref([])
const singerAlbums = ref([])
const singerMVs = ref([])

// 控制当前显示的 Tab
const currentTab = ref('songs')

const fetchSingerDetails = async () => {
    const id = singerId.value
    try {
        const res = await api.get('/artist/detail', { id })
        if (res.data) {
            const item = res.data
            singerdetails.value = [{
                pic: item.artist.cover,
                name: item.artist.name,
                identify: item.identify?.imageDesc || '',
                briefDesc: item.artist.briefDesc,
            }]
        }
    } catch (err) {
        console.error('获取歌手详情失败', err)
    }
}

const fetchSimSingersId = async () => {
    const id = singerId.value
    try {
        const res = await api.get('/simi/artist', { id })
        if (res.artists) {
            simSingers.value = res.artists.slice(0, 5).map((item) => ({
                name: item.name,
                pic: item.img1v1Url
            }))
        }
    } catch (err) {
        console.error('获取相似歌手失败', err)
    }
}

const fetchSingerSongs = async () => {
    const id = singerId.value
    try {
        const res = await api.get('/artists', { id })
        if (res.hotSongs) {
            singersongs.value = res.hotSongs.map((item) => ({
                name: item.name,
                duration: item.dt,
            }))
        }
    } catch (err) {
        console.error('获取歌手单曲失败', err)
    }
}

const fetchSingerAlbums = async () => {
    const id = singerId.value
    try {
        const res = await api.get('/artist/album', { id, limit: 10 })
        if (res.hotAlbums) {
            singerAlbums.value = res.hotAlbums.map((item) => ({
                pic: item.picUrl,
                name: item.name,
            }))
        }
    } catch (err) {
        console.error('获取歌手专辑失败', err)
    }
}

const fetchSingerMVs = async () => {
    const id = singerId.value
    try {
        const res = await api.get('/artist/mv', { id })
        if (res.mvs) {
            // 只取前10个，确保 2行5列
            singerMVs.value = res.mvs.slice(0, 10).map((item) => ({
                pic: item.imgurl,
                name: item.name,
                publishtime: item.publishTime,
                duration: item.duration,
            }))
        }
    } catch (err) {
        console.error('获取MV失败', err)
    }
}

const formatDuration = (ms) => {
    if (!ms) return '00:00'
    const totalSec = Math.floor(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

onMounted(() => {
    fetchSingerDetails()
    fetchSimSingersId()
    fetchSingerSongs()
    fetchSingerAlbums()
    fetchSingerMVs()
})

// 监听路由参数变化，当 id 变化时重新获取数据
watch(singerId, (newId, oldId) => {
    if (newId && newId !== oldId) {
        fetchSingerDetails()
        fetchSimSingersId()
        fetchSingerSongs()
        fetchSingerAlbums()
        fetchSingerMVs()
    }
})
</script>

<template>
    <div class="singer-content">
        <div class="singer-inner" v-if="singerdetails.length">
            
            <!-- 1. 歌手头部信息 -->
            <div class="singer-header">
                <div class="singer-desc">
                    <img :src="singerdetails[0].pic" class="singer-pic">
                    <div class="singer-info">
                        <h2 class="singer-name">{{ singerdetails[0].name }}</h2>
                        <div class="singer-identify">{{ singerdetails[0].identify }}</div>
                        <div class="singer-briefDesc" :title="singerdetails[0].briefDesc">
                            {{ singerdetails[0].briefDesc }}
                        </div>
                    </div>
                </div>
                
                <div class="sim-singers-aside">
                    <div class="sim-title">相似歌手</div>
                    <div class="sim-list">
                        <div class="sim-item" v-for="sim in simSingers" :key="sim.name">
                            <img :src="sim.pic" class="sim-avatar">
                            <span class="sim-name">{{ sim.name }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. Tab 切换 -->
            <div class="singer-tabs">
                <div class="tab-item" :class="{ active: currentTab === 'songs' }" @click="currentTab = 'songs'">单曲</div>
                <div class="tab-item" :class="{ active: currentTab === 'albums' }" @click="currentTab = 'albums'">专辑</div>
                <div class="tab-item" :class="{ active: currentTab === 'mvs' }" @click="currentTab = 'mvs'">MV</div>
            </div>

            <!-- 3. 内容展示区域 -->
            <div class="tab-content">
                
                <!-- 单曲列表 -->
                <div class="singer-songs" v-if="currentTab === 'songs'">
                    <ul class="songs-list">
                        <li v-for="(item, index) in singersongs" :key="index" class="song-item">
                            <span class="song-index">{{ (index + 1).toString().padStart(2, '0') }}</span>
                            <span class="song-name">{{ item.name }}</span>
                            <span class="song-time">{{ formatDuration(item.duration) }}</span>
                        </li>
                    </ul>
                </div>

                <!-- 专辑与MV 统一使用相同的 Grid 结构 -->
                <div class="grid-container" v-else>
                    <!-- 专辑视图 -->
                    <template v-if="currentTab === 'albums'">
                        <div v-for="item in singerAlbums" :key="item.name" class="card-item">
                            <div class="img-wrapper">
                                <img :src="item.pic" class="card-img">
                            </div>
                            <div class="card-info">
                                <div class="card-name" :title="item.name">{{ item.name }}</div>
                            </div>
                        </div>
                    </template>

                    <!-- MV 视图 -->
                    <template v-if="currentTab === 'mvs'">
                        <div v-for="item in singerMVs" :key="item.name" class="card-item">
                            <div class="img-wrapper">
                                <img :src="item.pic" class="card-img">
                                <span class="duration-tag">{{ formatDuration(item.duration) }}</span>
                            </div>
                            <div class="card-info">
                                <div class="card-name" :title="item.name">{{ item.name }}</div>
                                <div class="card-date">{{ item.publishtime }}</div>
                            </div>
                        </div>
                    </template>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
/* 基础容器：增加 box-sizing 确保内边距不撑开盒子 */
* {
    box-sizing: border-box;
}

.singer-content {
    max-width: 1100px;
    margin: 20px auto;
    background: #fff;
    padding: 20px;
    overflow: hidden; /* 防止内容溢出主容器 */
}

/* 头部样式保持不变 */
.singer-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
}

.singer-desc {
    display: flex;
    flex: 1;
    min-width: 0; /* 允许弹性子元素收缩 */
    margin-right: 40px;
}

.singer-pic {
    width: 200px;
    height: 200px;
    object-fit: cover;
    flex-shrink: 0;
}

.singer-info {
    margin-left: 25px;
    min-width: 0;
}

.singer-briefDesc {
    font-size: 13px;
    color: #666;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;
    overflow: hidden;
}

/* 相似歌手样式 */
.sim-singers-aside {
    width: 220px;
    border-left: 1px solid #eee;
    padding-left: 20px;
    flex-shrink: 0;
}

.sim-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.sim-item {
    width: 55px;
    text-align: center;
}

.sim-avatar {
    width: 50px;
    height: 50px;
    object-fit: cover;
}

.sim-name {
    font-size: 11px;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Tab 切换样式 */
.singer-tabs {
    display: flex;
    border-bottom: 1px solid #ddd;
    margin-bottom: 25px;
}

.tab-item {
    padding: 10px 35px;
    cursor: pointer;
    font-size: 15px;
    position: relative;
}

.tab-item.active {
    color: #31c27c;
    font-weight: bold;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #31c27c;
}

/* 单曲列表 */
.song-item {
    display: flex;
    padding: 10px;
    align-items: center;
}

.song-item:nth-child(odd) { background: #f9f9f9; }

.song-name {
    flex: 1;
    padding: 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 核心修改：Grid 布局解决方案 */
.grid-container {
    display: grid;
    /* repeat(5, minmax(0, 1fr)) 是防止溢出的关键，它强制列宽均分且不被内容撑开 */
    grid-template-columns: repeat(5, minmax(0, 1fr)); 
    gap: 25px 20px; /* 行间距 25px，列间距 20px */
    width: 100%;
}

.card-item {
    width: 100%;
    display: flex;
    flex-direction: column;
}

/* 图片容器：强制专辑和 MV 比例一致 */
.img-wrapper {
    position: relative;
    width: 100%;
    /* 使用 aspect-ratio 确保专辑和 MV 封面大小完全相同（都是正方形） */
    aspect-ratio: 1 / 1; 
    overflow: hidden;
    background: #f0f0f0;
    border-radius: 4px;
    border: 1px solid #eee;
}

.card-img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 关键：图片填充并裁剪，确保不变形且填满正方形 */
    display: block;
}

.card-info {
    margin-top: 10px;
}

.card-name {
    font-size: 14px;
    line-height: 1.4;
    color: #333;
    /* 处理长文本：两行截断 */
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; 
    overflow: hidden;
    text-overflow: ellipsis;
    height: 40px; /* 固定高度防止因标题长短导致对齐问题 */
}

.card-date {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
}

.duration-tag {
    position: absolute;
    bottom: 6px;
    right: 6px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
}
</style>