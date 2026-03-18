<script setup>
import { ref,computed,onMounted,watch } from "vue"
import { useRoute,useRouter } from "vue-router"
import api from "@/api"

const route = useRoute()
const songList = ref([])
const loading = ref(false)
const router=useRouter()

const keyword = computed(() => (route.query.keyword || '').toString())

const fetchSearchResult = async () =>{
    const kw = keyword.value.trim()
    songList.value=[]
    if(!kw) return
    loading.value=true
    try{
        const res = await api.get("/search",{ keywords:kw,limit:20  })
        const songs=res.result?.songs || []
        songList.value=songs.map((s)=>({
        id:s.id,
        name:s.name,
        artist:(s.artists || []).map((a)=>a.name).join("/"),
        album:s.album?.name || '' ,
        durationMs:s.duration || 0
    }))
    }catch(err){
        console.log("搜索歌曲失败:",err);
    }finally{
        loading.value=false
    }
}

const formatDuration=(ms)=>{
    if(!ms) return '00：00'
    const totalSec=Math.floor(ms/1000)
    const m=Math.floor(totalSec/60)
    const s=totalSec % 60
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
}

const handlePlay=(id)=>{

    if(!id) return

    router.push({name:'musicplayer',query:{id}})

}

watch(()=>keyword.value,()=>{
    fetchSearchResult()
})

onMounted(() =>{
    fetchSearchResult()
})
</script>


<template>
<div class="search-pag">
  <div class="search-inner">
    <h2 class="title">搜素结果</h2>
    <p class="keyword" v-if="keyword">关键字：{{ keyword }}</p>
    <p v-else class="keyword">暂无关键字，请在顶部搜索框输入内容</p>

    <div v-if="loading" class="tip">正在搜索中...</div>
    <div v-else-if="keyword && !songList.length" class="tip">
      未找到与 "{{keyword}}" 相关的歌曲
    </div>

    <ul v-else class="song-list">
      <li
        v-for="song in songList"
        :key="song.id"
        class="song-item"
        @click="handlePlay(song.id)"
      >
        <div class="song-main">
            <span class="song-name">{{ song.name }}</span>
            <span class="song-artist">{{ song.artist }}</span>
        </div>
        <div class="song-extra">
            <span class="song-album">{{ song.album }}</span>
            <span class="song-duration">{{ formatDuration(song.durationMs) }}</span>
        </div>
    </li>
    </ul>
  </div>
</div>
</template>

<style scoped>
.search-pag {
  padding: 20px 40px;
  background-color: #fff;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.search-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
}

.keyword {
  font-size: 14px;
  color: #666;
  margin-bottom: 25px;
}

.tip {
  padding: 40px;
  text-align: center;
  color: #999;
}

.song-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f2f2f2;
  transition: background-color 0.2s;
  cursor: pointer;
}

.song-item:hover {
  background-color: #f5f5f7;
}

.song-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.song-name {
  font-size: 15px;
  color: #333;
}

.song-artist {
  font-size: 13px;
  color: #999;
}

.song-extra {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 30px;
  min-width: 300px; /* 确保右侧对齐一致 */
}

.song-album {
  font-size: 13px;
  color: #999;
  text-align: right;
  flex: 1;
  /* 处理超长专辑名 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  font-size: 13px;
  color: #bbb;
  width: 50px;
  text-align: right;
}
</style>