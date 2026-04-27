import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      name:'wallpaper',
      component:()=>import ('../views/WallpaperPage.vue'),
    },
    {
      path:'/musichall',
      name:'musichall',
      component:()=>import ('../views/MusicHall.vue'),
    },
    {
      path:'/musiclist',
      name:'musiclist',
      //组件懒加载
      component:()=>import ('../views/MusicList.vue'),
    },
    {
      path:'/musicplayer',
      name:'musicplayer',
      component:()=>import ('../views/MusicPlayer.vue'),
    },
    {
      path:'/musicsearch',
      name:'musicsearch',
      component:()=>import ('../views/MusicSearch.vue'),
    },
    {
      path:'/mymusic',
      name:'mymusic',
      component:()=>import ('../views/MyMusic.vue'),
    },
    {
      path:'/login',
      name:'login',
      component:()=>import ('../views/Login.vue'),
    },
    {
      path:'/anchorplayer',
      name:'anchorplayer',
      component:()=>import ('../views/AnchorPlayer.vue')
    },
    {
      path:'/singerdetails',
      name:'singerdetails',
      component:()=>import('../views/SingerDetails.vue')
    },
    {
      path:'/singeralbums',
      name:'singeralbums',
      component:()=>import('../views/SingerAlbums.vue')
    }
  ],
})

export default router
