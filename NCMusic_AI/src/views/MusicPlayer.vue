<script setup>
import { ref,onMounted,computed,watch } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import api from '@/api'
import PlayModeSelector from '@/components/PlayModeSelector.vue'
import { ElButton, ElSlider } from 'element-plus'
import { ArrowLeft, ArrowRight, VideoPlay, VideoPause, RefreshRight } from '@element-plus/icons-vue'


const route = useRoute()
const router = useRouter()

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
const currentLyricIndex=ref(0) // 当前高亮的歌词行索引
const lyricsContainerRef=ref(null) // 歌词容器引用

// 播放列表相关
const playlist = ref([])
const currentPlaylistIndex = ref(0)
const playlistId = ref('') // 歌单ID

// 播放模式：0-顺序播放，1-随机播放，2-单曲循环，3-列表循环
const playMode = ref(0)
const playModeNames = ['顺序播放', '随机播放', '单曲循环', '列表循环']
const playModeIcons = ['↻', '⤮', '🔁', '🔂']

// 播放模式弹窗
const showPlayModeModal = ref(false)

// 随机播放的随机索引
const shuffledIndices = ref([])

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

//格式化歌词 - 解析时间戳
const parseLyrics=(raw='')=>{
    const lines = raw.split("\n").map((line)=>line.trim()).filter((line)=>line)
    const parsedLyrics=[]
    lines.forEach((line)=>{
        // 匹配时间戳格式 [00:00.00] 或 [00:00]
        const timeMatch = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/)
        if(timeMatch){
            const minutes = parseInt(timeMatch[1], 10)
            const seconds = parseInt(timeMatch[2], 10)
            const milliseconds = timeMatch[3] ? parseInt(timeMatch[3].padEnd(3, '0'), 10) : 0
            const time = minutes * 60 + seconds + milliseconds / 1000
            const text = line.replace(/\[[^\]]*]/g, '').trim()
            if(text){
                parsedLyrics.push({
                    time,
                    text
                })
            }
        }
    })
    return parsedLyrics
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
    // 根据播放模式处理歌曲结束
    if(playMode.value === 2){
        // 单曲循环
        handleReplay()
    }else{
        // 其他模式自动下一首
        handleNextSong()
    }
}

// 重播当前歌曲
const handleReplay=()=>{
    const audio = audioRef.value
    if(!audio) return
    audio.currentTime = 0
    audio.play().then(()=>{
        isPlaying.value = true
    }).catch(()=>{})
}

// 切换播放模式
const handleTogglePlayMode=()=>{
    showPlayModeModal.value = true
}

// 生成随机播放索引
const generateShuffledIndices=()=>{
    const indices = Array.from({length: playlist.value.length}, (_, i) => i)
    // Fisher-Yates 洗牌算法
    for(let i = indices.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1))
        ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    shuffledIndices.value = indices
    // 找到当前歌曲在随机列表中的位置
    const currentIndexInShuffled = shuffledIndices.value.findIndex(idx => idx === currentPlaylistIndex.value)
    if(currentIndexInShuffled !== -1){
        // 将当前歌曲移到开头
        shuffledIndices.value.unshift(...shuffledIndices.value.splice(currentIndexInShuffled, 1))
    }
}

// 下一首
const handleNextSong=()=>{
    if(playlist.value.length === 0) return

    let nextIndex
    if(playMode.value === 1){
        // 随机播放
        const currentIndexInShuffled = shuffledIndices.value.indexOf(currentPlaylistIndex.value)
        nextIndex = shuffledIndices.value[(currentIndexInShuffled + 1) % shuffledIndices.value.length]
    }else{
        // 顺序播放或列表循环
        nextIndex = (currentPlaylistIndex.value + 1) % playlist.value.length
    }

    playSongAtIndex(nextIndex)
}

// 上一首
const handlePrevSong=()=>{
    if(playlist.value.length === 0) return

    let prevIndex
    if(playMode.value === 1){
        // 随机播放
        const currentIndexInShuffled = shuffledIndices.value.indexOf(currentPlaylistIndex.value)
        prevIndex = shuffledIndices.value[(currentIndexInShuffled - 1 + shuffledIndices.value.length) % shuffledIndices.value.length]
    }else{
        // 顺序播放或列表循环
        prevIndex = (currentPlaylistIndex.value - 1 + playlist.value.length) % playlist.value.length
    }

    playSongAtIndex(prevIndex)
}

// 播放指定索引的歌曲
const playSongAtIndex=(index)=>{
    if(index < 0 || index >= playlist.value.length) return

    currentPlaylistIndex.value = index
    const song = playlist.value[index]
    if(song && song.id){
        // 更新路由但不触发重新加载
        router.replace({
            name: 'musicplayer',
            query: { id: song.id }
        })
        loadSong(song.id)
    }
}

// 加载歌曲数据
const loadSong=async(id)=>{
    fetchSongDetail(id)
    fetchLyrics(id)
    fetchSongUrl(id)
}

// 获取歌单信息
const fetchPlaylistDetail=async(id)=>{
    if(!id) return
    try{
        const res = await api.get('/playlist/detail',{id})
        const detail = res.playlist
        if(detail){
            playlist.value = detail.tracks?.map((t) => ({
                id: t.id,
                name: t.name,
                artist: (t.ar || t.artists || []).map((a) => a.name).join('/'),
                album: (t.al || t.album)?.name || '',
            })) || []
            playlistId.value = id
            // 找到当前歌曲在歌单中的索引
            currentPlaylistIndex.value = playlist.value.findIndex(song => song.id === Number(songId.value))
            // 如果是随机模式，生成随机索引
            if(playMode.value === 1){
                generateShuffledIndices()
            }
        }
    }catch(err){
        console.log('获取歌单失败',err)
    }
}

// 监听路由参数变化，重新加载歌曲
watch(songId,(newId)=>{
    if(newId && newId !== playlist.value[currentPlaylistIndex.value]?.id){
        loadSong(newId)
    }
})

const handleTimeUpdate=()=>{
    const audio=audioRef.value
    if(!audio) return
    currentTime.value=audio.currentTime || 0
    if(audio.duration){
        duration.value=audio.duration
    }

    // 更新当前高亮的歌词行
    updateCurrentLyric()
}

// 更新当前歌词高亮和滚动
const updateCurrentLyric=()=>{
    const time=currentTime.value
    if(!lyrics.value.length) return

    // 找到当前时间对应的歌词行
    let newIndex=0
    for(let i=lyrics.value.length-1;i>=0;i--){
        if(time>=lyrics.value[i].time){
            newIndex=i
            break
        }
    }

    // 如果歌词行发生变化，更新高亮并滚动
    if(newIndex!==currentLyricIndex.value){
        currentLyricIndex.value=newIndex
        scrollToCurrentLyric()
    }
}

// 滚动到当前歌词
const scrollToCurrentLyric=()=>{
    const container=lyricsContainerRef.value
    if(!container) return

    const currentLine=container.children[currentLyricIndex.value]
    if(!currentLine) return

    // 计算滚动位置，使当前歌词居中
    const containerHeight=container.clientHeight
    const lineTop=currentLine.offsetTop
    const lineHeight=currentLine.clientHeight
    const scrollTop=lineTop - containerHeight/2 + lineHeight/2

    container.scrollTo({
        top:scrollTop,
        behavior:'smooth'
    })
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

// 播放模式弹窗关闭回调
const handleModeSelectorClose=()=>{
    // 如果切换到随机播放模式，生成随机索引
    if(playMode.value === 1 && playlist.value.length > 0 && shuffledIndices.value.length === 0){
        generateShuffledIndices()
    }
}


onMounted(async()=>{
    await fetchSongDetail(songId.value)
    await fetchLyrics(songId.value)
    await fetchSongUrl(songId.value)
    // 尝试从路由获取歌单ID
    const playlistIdFromRoute = route.query.playlistId
    if(playlistIdFromRoute){
        await fetchPlaylistDetail(playlistIdFromRoute)
    }
    // 自动播放
    if(audioUrl.value){
        setTimeout(()=>{
            handleTogglePlay()
        }, 300)
    }
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
                        <div class="lyrics-content" ref="lyricsContainerRef">
                            <template v-if="lyrics.length">
                                <p
                                v-for="(line,index) in lyrics"
                                :key="index"
                                :class="{'lyrics-line--highlight':index===currentLyricIndex}"
                                class="lyrics-line"
                                >
                                {{ line.text }}
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
                    <el-button class="btn-circle" @click="handlePrevSong" title="上一首" :icon="ArrowLeft" circle />
                    <el-button class="btn-circle btm-large" @click="handleTogglePlay" :icon="isPlaying ? VideoPause : VideoPlay" circle />
                    <el-button class="btn-circle" @click="handleNextSong" title="下一首" :icon="ArrowRight" circle />
                    <el-button class="btn-circle btn-mode" @click="handleTogglePlayMode" :title="playModeNames[playMode]" :icon="RefreshRight" circle />
                </div>
                <div class="progress-warp">
                    <span class="time-label">{{ formatTime(currentTime) }}</span>
                    <el-slider 
                        v-model="currentTime" 
                        :max="duration || 100" 
                        @change="(val) => { if(audioRef) audioRef.currentTime = val }"
                        class="progress-bar"
                        :show-tooltip="false"
                    />
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

        <!-- 播放模式选择弹窗 -->
        <PlayModeSelector
            v-model="playMode"
            v-model:visible="showPlayModeModal"
            @close="handleModeSelectorClose"
        />
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
    cursor: pointer;
}

.lyrics-line:hover {
    color: rgba(255, 255, 255, 0.8);
}

/* 歌词高亮：对应图片中的青绿色/白色效果 */
.lyrics-line--highlight {
    color: #26ce8a;
    font-size: 20px;
    font-weight: bold;
    transform: scale(1.1);
    text-shadow: 0 0 10px rgba(38, 206, 138, 0.3);
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
    margin: 0 10px;
}

.progress-bar :deep(.el-slider__runway) {
    background-color: rgba(255,255,255,0.1);
    height: 4px;
}

.progress-bar :deep(.el-slider__bar) {
    background-color: #fff;
    height: 4px;
}

.progress-bar :deep(.el-slider__button) {
    width: 10px;
    height: 10px;
    background-color: #fff;
    border: none;
}

/* 控制按钮 */
.controls-main {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-bottom: 5px;
}

.btn-circle {
    background: transparent !important;
    border: 2px solid #fff !important;
    color: #fff !important;
    font-size: 16px;
    transition: all 0.2s;
    min-width: 45px;
}

.btn-circle.btm-large {
    font-size: 20px;
    padding: 20px !important;
}

.btn-circle.btn-mode {
    font-size: 18px;
    background: rgba(38, 206, 138, 0.1) !important;
    border-color: #26ce8a !important;
    color: #26ce8a !important;
}

.btn-circle:hover {
    background: rgba(255,255,255,0.1) !important;
    transform: scale(1.05);
}

.btn-circle.btn-mode:hover {
    background: rgba(38, 206, 138, 0.2) !important;
}

.audio-hidden {
    display: none;
}
</style>