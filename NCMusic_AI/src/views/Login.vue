<script setup>
import {ref,onMounted,watch,onBeforeUnmount} from 'vue'
import api from '../api/index'
import {useUserStore} from '../stores/user'
import { useRouter } from 'vue-router'

const router=useRouter()

//登录的二维码图片
const qrImg=ref('')

//状态管理
const userStore=useUserStore()

//获取登录key
const loginKey=ref('')

//轮询定时器
const qrCheckTimer=ref(null)

// 当前轮询的key，防止重复轮询
const currentCheckKey=ref('')

const handleOverlayClick=(event)=>{
    if(event.target===event.currentTarget){
        router.push("/")
    }
}

//获取二维码登录的key
const fetchLoginKey=async()=>{
    try{
        const res=await api.get("/login/qr/key")
        loginKey.value=res.data?.unikey || ''
    }catch(err){
        console.error('获取登录key失败:', err)
        loginKey.value=''
    }
}

//根据key获取二维码图片
const fetchQrImage=async(key)=>{
    if(!key) return
    try{
        const res = await api.get("/login/qr/create",
        {
            key,
            timestamp:Date.now(),
            ua:"pc",
            qrimg:true
        }
    )
    qrImg.value = res.data?.qrimg || ''
    }catch(err){
        console.error('获取二维码图片失败:', err)
        qrImg.value=''
    }
}

watch(
    ()=>loginKey.value,
    (val)=>{
        if(val){
            fetchQrImage(val)
        }
    }
)

// 轮询二维码状态，成功后保存用户信息
const startQrCheck = (key) =>{
    if(!key) return
    if(qrCheckTimer.value){
        clearInterval(qrCheckTimer.value)
    }
    qrCheckTimer.value = setInterval(async () =>{
        // 网络请求
        const res = await api.get("/login/qr/check",{
            key,
            timestamp:Date.now(),
            ua:"pc"
        })
        // 常见状态：800 为二维码过期,801 为等待扫码,802 为待确认,803 为授权登录成功
        // 处理二维码过期：自动重新获取新二维码，弹窗保持存在不消失
        if(res.code === 800){
            clearInterval(qrCheckTimer.value)
            qrCheckTimer.value = null
            fetchLoginKey() // 重新拉取新的二维码
            return
        }

        // 只有登录成功才执行后续操作！
        if(res.code === 803){
            clearInterval(qrCheckTimer.value)
            qrCheckTimer.value = null
            // 授权成功之后，再获取用户完整信息
            try{
                const statusRes = await api.get("/login/status",{
                    timestamp:Date.now(),
                    ua:"pc"
                })
                const profile = statusRes.data?.profile
                if(profile){
                    userStore.setUser({
                        id:profile.userId,
                        nickname:profile.nickname,
                        avatar:profile.avatarUrl
                    })
                }
            }catch(err){
                console.error("登录状态检查失败:", err)
            }
            // 只有登录成功才跳转首页
            router.push("/")
        }
        // 801(等待扫码)、802(待确认)：什么都不做，继续轮询，弹窗一直存在
    },3000)
}

watch(
  () => qrImg.value,
  (val) =>{
    if(val && loginKey.value) {
      startQrCheck(loginKey.value)
    }
  }
)

onMounted(()=>{
    // 检查是否已登录，避免重复登录
    if(userStore.isLoggedIn) {
        router.push("/")
        return
    }
    fetchLoginKey()
})

onBeforeUnmount(()=>{
    if(qrCheckTimer.value){
        clearInterval(qrCheckTimer.value)
        qrCheckTimer.value = null
        currentCheckKey.value = ''
    }
}
)

</script>

<template>
  <div class="login-overlay" @click="handleOverlayClick">
    <div class="login-modal" @click.stop>
      <div class="login-header">
        <h2>扫码登录网易云音乐</h2>
        <p>使用网易云音乐 APP 扫码登录，更安全更快捷</p>
      </div>
      <div class="login-body">
        <div class="qrcode-box">
          <div class="qrcode-placeholder">
            <template v-if="qrImg">
                <img :src="qrImg" alt="登录二维码">
            </template>
            <template v-else>
                <span>二维码加载中......</span>
            </template>
          </div>
          <p class="qrcode-tip">打开网易云音乐APP扫码登录</p>
        </div>
        <ul class="login-features">
            <li>同步收藏的歌单、歌曲和播放记录</li>
            <li>多端同步，随时随地畅听音乐</li>
            <li>更安全的扫码登录方式</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 蒙层：全屏居中 */
.login-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4); /* 半透明背景 */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

/* 登录弹窗主体 */
.login-modal {
    background-color: #fff;
    width: 520px;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    position: relative;
    box-sizing: border-box;
    z-index: 100;
}

/* 头部标题样式 */
.login-header h2 {
    font-size: 22px;
    font-weight: 600;
    color: #333;
    margin: 0 0 10px 0;
}

.login-header p {
    font-size: 13px;
    color: #666;
    margin-bottom: 30px;
}

/* 内容区域：左右布局 */
.login-body {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

/* 二维码区域 */
.qrcode-box {
    text-align: center;
    width: 180px;
}

.qrcode-placeholder {
    width: 160px;
    height: 160px;
    border: 1px solid #eee;
    padding: 5px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
}

.qrcode-placeholder img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.qrcode-placeholder span {
    font-size: 12px;
    color: #999;
}

.qrcode-tip {
    font-size: 12px;
    color: #666;
    margin-top: 15px;
    line-height: 1.4;
}

/* 右侧特性列表 */
.login-features {
    flex: 1;
    margin-left: 40px;
    padding: 0;
    list-style: none;
    margin-top: 10px;
}

.login-features li {
    font-size: 13px;
    color: #777;
    margin-bottom: 15px;
    line-height: 1.6;
    position: relative;
}

/* 如果需要列表前的点，可以开启这段，但图片中更像纯文字排版 */
/* 
.login-features li::before {
    content: "•";
    color: #ccc;
    margin-right: 8px;
} 
*/

/* 响应式：防止移动端显示问题 */
@media (max-width: 600px) {
    .login-modal {
        width: 90%;
        padding: 20px;
    }
    .login-body {
        flex-direction: column;
        align-items: center;
    }
    .login-features {
        margin-left: 0;
        margin-top: 20px;
        text-align: center;
    }
}
</style>