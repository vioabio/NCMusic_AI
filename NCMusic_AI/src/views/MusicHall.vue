<script setup>
import api from '../api/index.js';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 推荐歌单
const playlists = ref([])

const fetchPlayLists = async ()=>{
    try{
        const res = await api.get('/personalized',{limit:5})
        playlists.value=(res.result || []).map((item)=>({
        id: item.id,
        name: item.name,
        desc: item.copywriter || '',
        cover: item.picUrl,
    }))
    }catch(err){
        console.log('获取推荐歌单失败',err)
    }
}

// 点击到歌曲列表
const router=useRouter()
const handlePlayListClick =(id)=>{
    if(!id) return
    router.push({name:'musiclist',query:{id}})
}

// 推荐歌曲
const songslist = ref([])

const fetchSongsList =async ()=>{
    try{
        const res = await api.get('/personalized/newsong')
        songslist.value = (res.result || []).map((item)=>({
        id: item.id,
        name: item.name,
        cover: item.picUrl,
    }))
    }catch(err){
        console.log('获取推荐歌曲失败',err)
    }
}

const handleMusicPlayer=(id)=>{
    if(!id) return
    router.push({name:'musicplayer',query:{id}})
}

//每日电台
const djprograms = ref([])
const fetchdjprograms = async()=>{
    try{
        const res =await api.get('/personalized/djprogram')
        djprograms.value = (res.result || []).map((item)=>({
        id: item.id,
        name: item.name,
        desc: item.copywriter || '',
        cover: item.picUrl,
    }))
    }catch(err){
        console.log('获取推荐电台失败',err)
    }
}

const handleDjprogramsPlayer=(id)=>{
    if(!id) return
    router.push({name:'anchorplayer',query:{id}})
}
onMounted(()=>{
    fetchPlayLists()
    fetchSongsList()
    fetchdjprograms()
})

</script>

<template>
    <div class="hall-wrapper">
        <!-- 推荐歌单/歌曲/电台 -->
        <div class="hall-inner">
            <!-- 每日推荐歌曲 -->
            <h2 class="section-title">推荐歌单</h2>
            <ul class="playlists">
                <!-- 推荐歌单样式：歌单图片+标题 -->
                <li 
                v-for="item in playlists"
                :key="item.id"
                class="playlists-item"
                @click="handlePlayListClick(item.id)"
                >
                    <div class="cover-warpper">
                        <img :src="item.cover" :alt="item.name">
                    </div>
                    <div class="info">
                        <p class="name">{{item.name}}</p>
                        <p class="desc">{{item.desc}}</p>
                    </div>
                </li>
            </ul>
            <!-- 每日推荐歌曲 -->
            <h2 class="section-title">推荐歌曲</h2>
            <ul class="songslist">
                <li 
                v-for="item in songslist"
                :key="item.id"
                class="songslist-item"
                @click="handleMusicPlayer(item.id)"
                >
                    <div class="songslist-cover">
                        <img :src="item.cover" :alt="item.name">
                    </div>
                    <div class="songslist-name">
                        <p class="name">{{ item.name }}</p>
                        <p class="desc">{{ item.desc }}</p>
                    </div>
                </li>
            </ul>
            <!-- 推荐每日电台 -->
            <h2 class="section-title">推荐电台</h2>
            <ul class="djprogram">
                <li
                v-for="item in djprograms" 
                :key="item.id"
                class="djprogram-item"
                @click="handleDjprogramsPlayer(item.id)"
                >
                    <div class="djprogram-cover">
                        <img :src="item.cover" :alt="item.name">
                    </div>
                    <div class="djprogram-desc">
                        <p class="name">{{ item.name }}</p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
/* 容器基础样式 */
.hall-wrapper {
    background-color: #f5f5f5;
    padding: 20px 0;
    font-family: Arial, Helvetica, sans-serif;
}

.hall-inner {
    width: 980px;
    margin: 0 auto;
    background-color: #fff;
    border: 1px solid #d3d3d3;
    padding: 20px 20px 40px;
    box-sizing: border-box;
}

/* 标题样式：复刻红色下划线和圆点 */
.section-title {
    height: 33px;
    padding: 0 10px 0 34px;
    background: url('https://s2.music.126.net/style/web2/img/index/index.png?905669047076a9a08151528615b369c7') no-repeat -225px -156px;
    border-bottom: 2px solid #C10D0C;
    font-size: 20px;
    font-weight: normal;
    line-height: 28px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

/* 列表通用重置 */
ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
}

/* 1. 推荐歌单样式（4列布局） */
.playlists {
    justify-content: space-between;
    margin-bottom: 30px;
}

.playlists-item {
    width: 140px;
    margin-bottom: 30px;
}

.cover-warpper {
    position: relative;
    width: 140px;
    height: 140px;
}

.cover-warpper img {
    width: 100%;
    height: 100%;
    display: block;
    border: 1px solid #ccc;
}

.cover-warpper::after {
    content: "🎧";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 27px;
    background: rgba(0,0,0,0.4);
    color: #ccc;
    font-size: 12px;
    line-height: 27px;
    padding-left: 10px;
    box-sizing: border-box;
}

.playlists-item .name {
    margin: 8px 0 3px;
    font-size: 14px;
    color: #333;
    line-height: 1.4;
    cursor: pointer;
}

.playlists-item .name:hover {
    text-decoration: underline;
}

.playlists-item .desc {
    font-size: 12px;
    color: #666;
}

/* 2. 推荐歌曲样式（模拟“新碟上架”的灰色背景和黑胶效果） */
.songslist {
    background: #f5f5f5;
    border: 1px solid #d3d3d3;
    margin: 20px 0 40px;
    padding: 20px 10px;
    display: grid;
    grid-template-columns: repeat(5, 118px);
    justify-content: space-between;
    gap: 20px 0; 
}

.songslist-item {
    width: 118px;
    height: 150px;
    margin: 0; 
}


.songslist-cover {
    position: relative;
    width: 100px;
    height: 100px;
}

.songslist-cover img {
    width: 100%;
    height: 100%;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 2;
    position: relative;
}

.songslist-cover::after {
    content: "";
    position: absolute;
    top: 0;
    right: -15px;
    width: 100px;
    height: 100px;
    background: #000;
    border-radius: 50%;
    z-index: 1;
    background: repeating-radial-gradient(circle, #333, #000 5px);
    border: 1px solid #333;
}

.songslist-name .name {
    font-size: 12px;
    color: #333;
    margin: 8px 0 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.songslist-name .desc {
    font-size: 12px;
    color: #666;
}

/* 3. 推荐电台样式（紧凑栅格布局） */
.djprogram {
    display: grid;
    grid-template-columns: repeat(6, 140px); 
    justify-content: space-between;
    gap: 20px 0; 
}

.djprogram-item {
    width: 140px;
    margin: 0; 
}

.djprogram-item:nth-child(6n) {
    margin-right: 0;
}

.djprogram-cover img {
    width: 140px;
    height: 140px;
    border: 1px solid #eee;
}

.djprogram-desc .name {
    font-size: 12px;
    color: #333;
    margin-top: 5px;
}

/* 辅助样式：隐藏多余文本 */
p {
    margin: 0;
}
</style>