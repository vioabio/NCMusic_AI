<script setup>
import { useRoute } from 'vue-router';
import {ref,computed,onMounted} from 'vue'
import api from '@/api';


const route = useRoute()
const anchorId=computed(()=>route.query.id)
const anchorlist=ref([])

//注意res返回数据的格式
const fetchAnchorDetail=async(id)=>{
    const res = await api.get('/dj/program/detail',{id})
    try{
        if(res.program){
            const item=res.program
            anchorlist.value=[{
            categoryName:item.categoryName,
            coverUrl:item.coverUrl,
            description:item.description,
            artist:item.mainSong.album.artist.name,
        }]
        console.log(anchorlist)
    }
    }catch(err){
        console.log('获取电台信息失败',err)
        anchorlist.value=[]
    }
}

onMounted(()=>{
    fetchAnchorDetail(anchorId.value)
})
</script>

<template>
    <div class="anchor-content">
        <div v-if="anchorlist.length===0" class="tip">暂无电台信息......</div>
        <div v-else class="anchor-inner">
            <div class="categoryName">{{anchorlist[0].categoryName}}</div>
            <img :src="anchorlist[0].coverUrl"  alt="电台封面" class="coverUrl">
            <div class="anchor-artist">{{ anchorlist[0].artist }}</div>
            <div class="description">{{ anchorlist[0].description }}</div>
        </div>
    </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.anchor-content {
  max-width: 1100px;
  margin: 30px auto;
  padding: 0 20px;
}
.tip {
  text-align: center;
  color: #999;
  padding: 50px 0;
  font-size: 16px;
}
.anchor-inner {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: auto auto auto auto;
  grid-template-areas: 
    "cover title"
    "cover artist"
    "cover buttons"
    "desc desc";
  gap: 20px 32px;
  align-items: start;
}

/* 分配现有元素位置 */
.categoryName {
  grid-area: title;
  font-size: 36px;
  font-weight: 400;
  color: #222;
  line-height: 1.5;
  position: relative;
  padding-left: 20px;
}

.coverUrl {
  grid-area: cover;
  width: 100%;
  height: auto;
  border: 1px solid #d1d5db;
  border-radius: 2px;
  object-fit: cover;
}

.anchor-artist {
  grid-area: artist;
  display: flex;
  align-items: center;
  font-size: 28px;
  color: #555;
  font-weight: 400;
}

.description {
  grid-area: desc;
  padding-top: 24px;
  border-top: 1px solid #eee;
  font-size: 18px;
  line-height: 1.8;
  color: #666;
}

/* 播放次数变红 */
.description::after {
  color: #666;
}
.description::after .play-count {
  color: #dc2626;
  font-weight: bold;
}
</style>