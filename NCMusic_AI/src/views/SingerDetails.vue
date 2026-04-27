<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';
import api from '../api/index';
import { ElTabs, ElTabPane, ElCard, ElAvatar } from 'element-plus';

const route = useRoute()
const router=useRouter()
const singerId = computed(() => route.query.id)

// 响应式数据
const singerdetails = ref([])
const singerFans = ref(0)
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

const fetchSingerFans=async()=>{
    const id = singerId.value
    const res = await api.get('/artist/follow/count',{id})
    singerFans.value=res.data.fansCnt
}

const fetchSimSingersId = async () => {
    const id = singerId.value
    try {
        const res = await api.get('/simi/artist', { id })
        if (res.artists) {
            simSingers.value = res.artists.slice(0, 6).map((item) => ({
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
                id: item.id,
                name: item.name,
                duration: item.dt,
            }))
        }
    } catch (err) {
        console.error('获取歌手单曲失败', err)
    }
}

const handlePlaySongs=(id)=>{
    if(!id) return
    router.push({name:'musicplayer',query:{id}})
}


const fetchSingerAlbums = async () => {
    const id = singerId.value
    try {
        const res = await api.get('/artist/album', { id, limit: 10 })
        if (res.hotAlbums) {
            singerAlbums.value = res.hotAlbums.map((item) => ({
                id:item.id,
                pic: item.picUrl,
                name: item.name,
            }))
        }
    } catch (err) {
        console.error('获取歌手专辑失败', err)
    }
}

// 用户点击专辑图片跳转至对应的专辑界面
const handleSingerAlbums=async(id)=>{
    if(!id) return 
    router.push({name:'singeralbums',query:{id}})
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
    fetchSingerFans()
    fetchSimSingersId()
    fetchSingerSongs()
    fetchSingerAlbums()
    fetchSingerMVs()
})

// 监听路由参数变化，当 id 变化时重新获取数据
watch(singerId, (newId, oldId) => {
    if (newId && newId !== oldId) {
        fetchSingerDetails()
        fetchSingerFans()
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
            
            <!-- 歌手信息 -->
            <div class="singer-header">
                <div class="singer-desc">
                    <el-avatar :src="singerdetails[0].pic" :size="200" class="singer-pic" shape="square" />
                    <div class="singer-info">
                        <h2 class="singer-name">{{ singerdetails[0].name }}</h2>
                        <div class="singer-identify">身份：{{ singerdetails[0].identify }}</div>
                        <div class="singer-fans">粉丝数量：{{ singerFans }}</div>
                        <div class="singer-briefDesc" :title="singerdetails[0].briefDesc">
                            {{ singerdetails[0].briefDesc }}
                        </div>
                    </div>
                </div>
                
                <div class="sim-singers-aside">
                    <div class="sim-title">相似歌手</div>
                    <div class="sim-list">
                        <div class="sim-item" v-for="sim in simSingers" :key="sim.name">
                            <el-avatar :src="sim.pic" :size="50" class="sim-avatar" />
                            <span class="sim-name">{{ sim.name }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 歌曲列表 -->
            <el-tabs v-model="currentTab" class="singer-tabs">
                <el-tab-pane label="单曲" name="songs">
                    <div class="singer-songs">
                        <ul class="songs-list">
                            <li v-for="(item, index) in singersongs" :key="index" class="song-item" @click="handlePlaySongs(item.id)">
                                <span class="song-index">{{ (index + 1).toString().padStart(2, '0') }}</span>
                                <span class="song-name">{{ item.name }}</span>
                                <span class="song-time">{{ formatDuration(item.duration) }}</span>
                            </li>
                        </ul>
                    </div>
                </el-tab-pane>
                
                <el-tab-pane label="专辑" name="albums">
                    <div class="grid-container">
                        <el-card v-for="item in singerAlbums" :key="item.name" class="card-item" :body-style="{ padding: '0' }" shadow="hover" @click="handleSingerAlbums(item.id)">
                            <div class="img-wrapper">
                                <img :src="item.pic" class="card-img">
                            </div>
                            <div class="card-info">
                                <div class="card-name" :title="item.name">{{ item.name }}</div>
                            </div>
                        </el-card>
                    </div>
                </el-tab-pane>
                
                <el-tab-pane label="MV" name="mvs">
                    <!-- MV 视图 -->
                    <div class="grid-container">
                        <el-card v-for="item in singerMVs" :key="item.name" class="card-item" :body-style="{ padding: '0' }" shadow="hover" >
                            <div class="img-wrapper">
                                <img :src="item.pic" class="card-img">
                                <span class="duration-tag">{{ formatDuration(item.duration) }}</span>
                            </div>
                            <div class="card-info">
                                <div class="card-name" :title="item.name">{{ item.name }}</div>
                                <div class="card-date">{{ item.publishtime }}</div>
                            </div>
                        </el-card>
                    </div>
                </el-tab-pane>
            </el-tabs>
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
    margin-bottom: 25px;
}

.singer-tabs :deep(.el-tabs__item) {
    padding: 10px 35px;
    font-size: 15px;
}

.singer-tabs :deep(.el-tabs__item.is-active) {
    color: #31c27c;
    font-weight: bold;
}

.singer-tabs :deep(.el-tabs__active-bar) {
    background-color: #31c27c;
}

.singer-tabs :deep(.el-tabs__nav-wrap::after) {
    background-color: #ddd;
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
    border: none;
}

.card-item :deep(.el-card__body) {
    width: 100%;
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