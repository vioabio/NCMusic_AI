<!-- 专辑详情组件 -->
<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';
import { ElButton, ElIcon, ElMessage } from 'element-plus';
import { ArrowLeft, VideoPlay, Folder, ChatDotRound, PictureFilled } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const albumId = computed(() => route.query.id);
const albumDetails = ref(null);
const albumSongs = ref([]);
const loading = ref(false);

const fetchAlbumDetails = async () => {
    const id = albumId.value;
    if (!id) return;

    loading.value = true;
    try {
        const res = await api.get('/album', { id });
        if (res && res.album) {
            albumDetails.value = {
                id: res.album.id,
                name: res.album.name,
                artist: res.album.artist || res.album.artists?.[0] || {},
                company: res.album.company || '未知发行商',
                desc: res.album.description || '暂无简介',
                picUrl: res.album.picUrl || res.album.blurPicUrl || '',
                publishTime: res.album.publishTime || 0,
                size: res.album.size || 0,
                info: res.album.info || {},
            };
            if (res.songs && res.songs.length) {
                albumSongs.value = res.songs.map((item) => ({
                    id: item.id,
                    name: item.name,
                    duration: item.dt || item.duration,
                    artist: (item.ar || item.artists || []).map(a => a.name).join('/'),
                    album: (item.al || item.album || {}).name || '',
                    pic: (item.al || item.album || {}).picUrl || res.album.picUrl || '',
                }));
            }
        }
    } catch (err) {
        console.error('获取专辑详情失败', err);
        ElMessage.error('获取专辑详情失败');
    } finally {
        loading.value = false;
    }
};

const handlePlaySong = (song) => {
    if (!song || !song.id) return;
    router.push({
        name: 'musicplayer',
        query: {
            id: song.id,
            name: song.name,
            artist: song.artist,
            album: song.album,
            pic: song.pic,
        },
    });
};

const handlePlayAlbum = () => {
    if (!albumSongs.value.length) return;
    const song = albumSongs.value[0];
    handlePlaySong(song);
    ElMessage.success(`正在播放专辑：${albumDetails.value?.name}`);
};

const formatDuration = (ms) => {
    if (!ms) return '00:00';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};


const formatPublishTime = (timestamp) => {
    if (!timestamp) return '未知';
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

const goBack = () => {
    if (albumDetails.value?.artist?.id) {
        router.push({ name: 'singerdetails', query: { id: albumDetails.value.artist.id } });
    } else {
        router.back();
    }
};

onMounted(() => {
    fetchAlbumDetails();
});
</script>

<template>
    <div class="album-content" v-loading="loading">
        <div class="album-header" v-if="albumDetails">
            <el-button class="back-btn" :icon="ArrowLeft" @click="goBack" text>
                返回
            </el-button>
            <div class="album-info-wrapper">
                <div class="album-cover">
                    <el-icon v-if="!albumDetails.picUrl" class="cover-placeholder"><PictureFilled /></el-icon>
                    <img v-else :src="albumDetails.picUrl" :alt="albumDetails.name" class="cover-img">
                </div>

                <div class="album-info">
                    <h1 class="album-name">{{ albumDetails.name }}</h1>
                    <div class="album-artist" @click="goBack">
                        <span class="artist-label">歌手：</span>
                        <span class="artist-name">{{ albumDetails.artist.name || '未知歌手' }}</span>
                    </div>
                    <div class="album-meta">
                        <span class="meta-item">
                            <el-icon><Folder /></el-icon>
                            发行时间：{{ formatPublishTime(albumDetails.publishTime) }}
                        </span>
                        <span class="meta-item">
                            <el-icon><ChatDotRound /></el-icon>
                            发行厂商：{{ albumDetails.company }}
                        </span>
                        <span class="meta-item">歌曲数：{{ albumSongs.length }} 首</span>
                    </div>

                    <div class="album-actions">
                        <el-button type="primary" :icon="VideoPlay" @click="handlePlayAlbum" class="play-btn">
                            播放全部
                        </el-button>
                    </div>

                    <div class="album-desc" v-if="albumDetails.desc && albumDetails.desc !== '暂无简介'">
                        <div class="desc-title">专辑简介</div>
                        <div class="desc-content">{{ albumDetails.desc }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="song-list-section" v-if="albumSongs.length">
            <div class="section-header">
                <h2 class="section-title">歌曲列表</h2>
                <span class="song-count">共 {{ albumSongs.length }} 首</span>
            </div>
            <div class="song-list">
                <div
                    v-for="(song, index) in albumSongs"
                    :key="song.id"
                    class="song-item"
                    @dblclick="handlePlaySong(song)"
                >
                    <span class="song-index">{{ (index + 1).toString().padStart(2, '0') }}</span>
                    <div class="song-info">
                        <span class="song-name" :title="song.name">{{ song.name }}</span>
                        <span class="song-artist" v-if="song.artist">{{ song.artist }}</span>
                    </div>
                    <span class="song-duration">{{ formatDuration(song.duration) }}</span>
                </div>
            </div>
        </div>

        <div class="empty-state" v-if="!loading && !albumDetails">
            <el-icon :size="60" color="#ccc"><Folder /></el-icon>
            <p>暂无专辑数据</p>
            <el-button type="primary" @click="goBack">返回</el-button>
        </div>
    </div>
</template>

<style scoped>
.album-content {
    max-width: 1100px;
    margin: 20px auto;
    background: #fff;
    padding: 30px;
    border-radius: 8px;
    min-height: 500px;
}

.back-btn {
    margin-bottom: 20px;
    color: #666;
}
.back-btn:hover {
    color: #C20C0C;
}

.album-info-wrapper {
    display: flex;
    gap: 30px;
}

.album-cover {
    width: 250px;
    height: 250px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #eee;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.cover-placeholder {
    font-size: 50px;
    color: #ccc;
}

.album-info {
    flex: 1;
    min-width: 0;
}

.album-name {
    font-size: 28px;
    font-weight: bold;
    color: #333;
    margin: 0 0 15px 0;
    line-height: 1.3;
}

.album-artist {
    margin-bottom: 15px;
    cursor: pointer;
}
.artist-label {
    color: #999;
    font-size: 14px;
}
.artist-name {
    color: #C20C0C;
    font-size: 15px;
    font-weight: 500;
    transition: color 0.2s;
}
.artist-name:hover {
    color: #ff4757;
    text-decoration: underline;
}

.album-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
    color: #666;
    font-size: 13px;
}
.meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
}
.meta-item .el-icon {
    font-size: 14px;
}

.album-actions {
    margin-bottom: 25px;
}
.play-btn {
    background: #C20C0C;
    border-color: #C20C0C;
    padding: 10px 30px;
    font-size: 14px;
}
.play-btn:hover {
    background: #ff4757;
    border-color: #ff4757;
}

.album-desc {
    margin-top: 20px;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 6px;
    border-left: 3px solid #C20C0C;
}
.desc-title {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
}
.desc-content {
    font-size: 13px;
    color: #666;
    line-height: 1.8;
    white-space: pre-wrap;
    max-height: 150px;
    overflow-y: auto;
}

.song-list-section {
    margin-top: 40px;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #C20C0C;
}

.section-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin: 0;
}

.song-count {
    font-size: 13px;
    color: #999;
}

.song-list {
    border-radius: 6px;
    overflow: hidden;
}

.song-item {
    display: flex;
    align-items: center;
    padding: 12px 15px;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 1px solid #f0f0f0;
}
.song-item:nth-child(odd) {
    background: #f9f9f9;
}
.song-item:hover {
    background: #f0f0f0;
}
.song-item:last-child {
    border-bottom: none;
}

.song-index {
    width: 40px;
    font-size: 14px;
    color: #999;
    text-align: center;
    flex-shrink: 0;
}

.song-info {
    flex: 1;
    min-width: 0;
    margin: 0 15px;
}

.song-name {
    display: block;
    font-size: 14px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.song-artist {
    display: block;
    font-size: 12px;
    color: #999;
    margin-top: 3px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.song-duration {
    font-size: 13px;
    color: #999;
    flex-shrink: 0;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    color: #999;
}
.empty-state p {
    margin: 20px 0;
    font-size: 14px;
}
</style>