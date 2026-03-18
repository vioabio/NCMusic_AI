<script setup>
import { ref,onMounted,computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'


const route = useRoute()

const songId=computed(()=>route.query.id)

const audioRef=ref(null)

const songTitle=ref('正在播放的歌曲')
const songArtist=ref('歌手姓名')
const songAlbum=ref('专辑名称')
const songCover=ref('/NCMusic/src/assets/imgs/songCover.jpg')
const lyrics=ref([])

const audioUrl=ref('')

const currentTime=ref(0)
const duration=ref(0)
const isPlaying=ref(false)

const fetchSongDetail=async(id)=>{
    if(!id) return
    try{
    const res=await api.get("/song/detail",{ids:id})
    const detail=(res.songs || [])[0]
    if(detail){
        songTitle.value=detail.name || '未知歌曲'
        songArtist.value=(detail.ar || detail.artists || []).map((a)=>a.name).join("/") || "未知歌手"
        songAlbum.value=(detail.al || detail.album)?.name || "未知专辑"
        songCover.value=(detail.al || detail.album)?.picUrl || "/NCMusic/src/assets/imgs/songCover.jpg"
    }
    }catch(err){
        console.log("获取歌曲详情失败:",err);
        songTitle.value='正在播放的歌曲'
        songArtist.value='歌手姓名'
        songAlbum.value='专辑名称'
        songCover.value='/NCMusic/src/assets/imgs/songCover.jpg'
    }
}

//格式化歌词
const parseLyrics=(raw='')=>{
    return raw.split("\n").map((line)=>line.trim()).filter((line)=>line).map((line)=>{
        const text= line.replace(/^\[[^\]]*]/g,'').trim()
        return text || line
    })
}

//获取歌词
const fetchLyrics=async(id)=>{
    if(!id) return
    try{
        const res=await api.get("/lyric",{id})
        const raw=res.lrc?.lyric || ''
        lyrics.value=parseLyrics(raw)
        
    }catch(err){
        console.log("获取歌词失败:",err);
    }
}

//获取播放地址
const fetchSongUrl=async(id)=>{
    if(!id) return
    try{
        const res=await api.get('/song/url',{id})
        const item=(res.data || [])[0]
        audioUrl.value=item?.url || ''
        currentTime.value=0
        duration.value=0
        isPlaying.value=false
    }catch(err){
        console.log("获取播放地址失败:",err);
        audioUrl.value=''
        isPlaying.value =false
    }

}

const handleLoadeMetaData=()=>{
    const audio=audioRef.value
    if(audio) return
    duration.value=audio.duration || 0
    currentTime.value=audio.currentTime || 0
}

const formatTime = (sec) =>{
    if(!sec || !Number.isFinite(sec)) return "00:00"
    const s = Math.floor(sec)
    const m = Math.floor(s / 60)
    const rs = s % 60
    const mm = m.toString().padStart(2, "0")
    const ss = rs.toString().padStart(2, "0")
    return `${mm}:${ss}`
}

const handleTogglePlay = () =>{
    const audio = audioRef.value
    if (!audio || !audioUrl.value) return
    if(audio.paused){
        audio.play().then(() =>{
            isPlaying.value = true
        }).catch(() =>{})
    }else{
        audio.pause()
        isPlaying.value = false
    }
}

const handleAudioEnded=()=>{
    isPlaying.value = false
}

const handleTimeUpdate=()=>{
    const audio=audioRef.value
    if(!audio) return
    currentTime.value=audio.currentTime || 0
    if(audio.duration){
        duration.value=audio.duration
    }
}

const handleProgressClick = (event) =>{
    const bar = event.currentTarget
    const rect = bar.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    const audio = audioRef.value
    const newTime = duration.value * ratio
    if(!audio) return
    audio.currentTime = newTime
    currentTime.value = newTime
}

onMounted(()=>{
    fetchSongDetail(songId.value)
    fetchLyrics(songId.value)
    fetchSongUrl(songId.value)
})

</script>

<template>
    <div class="player-page">
        <div class="player-inner">
            <div class="player-main">
                <!-- 左侧：封面基本信息 -->
                <div class="player-left">
                    <div class="cover-wrap">
                        <div class="cover-disc">
                            <img class="cover-img" :src="songCover" alt="封面">
                        </div>
                    </div>
                    <div class="song-meta">
                        <h2 class="song-title">{{ songTitle }}</h2>
                        <p class="song-artist">{{ songArtist }}</p>
                        <p class="song-album">{{ songAlbum }}</p>
                    </div>
                </div>
                <!-- 右侧：歌词 -->
                <div class="player-right">
                    <div class="lyrics-card">
                        <h3 class="lyrics-title">歌词</h3>
                        <div class="lyrics-content">
                            <template v-if="lyrics.length">
                                <p
                                v-for="(line,index) in lyrics"
                                :key="index" 
                                :class="{'lyrics-line--highlight':index===0}"
                                class="lyrics-line"
                                >
                                {{ line }}
                            </p>
                            </template>
                            <p v-else class="lyrics-line">暂无歌词</p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 底部：控制区域 -->
            <div class="player-controls">
                <div class="controls-main">
                    <button class="btn-circle btm-large" @click="handleTogglePlay">{{ isPlaying ? '暂停' : '播放' }}</button>
                </div>
                <div class="progress-warp">
                    <span class="time-label">{{ formatTime(currentTime) }}</span>
                    <div class="progress-bar" @click="handleProgressClick">
                        <div class="progress-inner" :style="{width:duration ? `${(currentTime/duration)*100}%` :'0%'}"></div>
                    </div>
                    <span class="time-label">{{ formatTime(duration) }}</span>
                </div>
                <audio 
                    :src="audioUrl"
                    v-if="audioUrl"
                    ref="audioRef"
                    class="audio-hidden"
                    @loademetadata="handleLoadeMetaData"
                    @timeupdate="handleTimeUpdate"
                    @ended="handleAudioEnded"
                ></audio>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 全局容器：深色渐变背景 */
.player-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #4b1a26 0%, #210a10 100%);
    color: #fff;
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.player-inner {
    width: 90%;
    max-width: 1200px;
    height: 80vh;
    display: flex;
    flex-direction: column;
    position: relative;
}

/* 主体区域布局 */
.player-main {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 40px;
}

/* 左侧：封面与信息 */
.player-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.cover-wrap {
    position: relative;
    width: 300px;
    height: 300px;
}

/* 唱片旋转盘效果 */
.cover-disc {
    position: relative;
    width: 280px;
    height: 280px;
    background: #000;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    background: repeating-radial-gradient(
        circle,
        #111,
        #111 2px,
        #222 5px
    );
}

.cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px; /* 封面略微圆角 */
    border: 2px solid rgba(255,255,255,0.1);
}

/* 歌曲信息 */
.song-meta {
    margin-top: 30px;
    text-align: center;
}

.song-title {
    font-size: 24px;
    margin-bottom: 10px;
    font-weight: 500;
}

.song-artist, .song-album {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 4px 0;
}

/* 右侧：歌词区域 */
.player-right {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lyrics-card {
    width: 80%;
    height: 400px;
    text-align: center;
}

.lyrics-title {
    font-size: 18px;
    margin-bottom: 20px;
    opacity: 0.8;
}

.lyrics-content {
    height: 350px;
    overflow-y: auto;
    scrollbar-width: none; /* Firefox */
}

.lyrics-content::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
}

.lyrics-line {
    padding: 10px 0;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
}

/* 歌词高亮：对应图片中的青绿色/白色效果 */
.lyrics-line--highlight {
    color: #26ce8a; 
    font-size: 18px;
    font-weight: bold;
    transform: scale(1.1);
}

/* 底部控制栏 */
.player-controls {
    height: 100px;
    border-top: 1px solid rgba(255,255,255,0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
}

/* 进度条 */
.progress-warp {
    display: flex;
    align-items: center;
    padding: 10px 0;
}

.time-label {
    font-size: 12px;
    color: rgba(255,255,255,0.5);
    width: 50px;
    text-align: center;
}

.progress-bar {
    flex: 1;
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    margin: 0 10px;
}

.progress-inner {
    height: 100%;
    background: #fff;
    border-radius: 2px;
    position: relative;
}

/* 进度条上的小白点 */
.progress-inner::after {
    content: "";
    position: absolute;
    right: -4px;
    top: -3px;
    width: 10px;
    height: 10px;
    background: #fff;
    border-radius: 50%;
}

/* 控制按钮 */
.controls-main {
    display: flex;
    justify-content: center;
    margin-bottom: 5px;
}

.btn-circle {
    background: transparent;
    border: 2px solid #fff;
    color: #fff;
    padding: 8px 25px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.btn-circle:hover {
    background: rgba(255,255,255,0.1);
}

.audio-hidden {
    display: none;
}
</style>