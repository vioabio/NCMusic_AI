// 网络封装
// 这部分处理网络封装
import axios from "axios";

const BASE_URL='/api'

// 创建实例对象
const instance=axios.create(
    {
        baseURL:BASE_URL,
        timeout:10000,
        withCredentials:true
    }
)

// 请求拦截器，统一添加token
instance.interceptors.request.use(
    (config)=>{
        // 添加token，token是判断用户是否登录的凭证
        return config
    },
    (error)=>Promise.reject(error)
)

//响应拦截器，统一处理code/错误
instance.interceptors.response.use(
    (response)=>{
        const res=response.data
        return res
    },
    (error)=>{
        //处理全局错误
        return Promise.reject(error)
    }
)

//封装GET/POST

export function get(url,params={},config={}){
    return instance.get(url,{params,...config})
}

export function post(url,data={},config={}){
    return instance.post(url,data,config)
}

const api={
    get,
    post
}
export default api