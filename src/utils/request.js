import storage from 'store'
import axios from 'axios'
import { Modal, message } from 'ant-design-vue'
import store from '@/store'
import notification from 'ant-design-vue/es/notification'
import { ACCESS_TOKEN } from '@/store/mutation-types'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // 跨域请求时发送cookies
  timeout: 5000 // 超时时间
})

// request 拦截器（发出请求前处理）
/* service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['X-Token'] = storage.get(ACCESS_TOKEN)
    }
    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
) */

service.interceptors.request.use(config => {
  const token = storage.get(ACCESS_TOKEN)
  if (token) {
    config.headers['X-Token'] = token // 让每个请求携带自定义 token 请根据实际情况自行修改
  }
  return config
}, err)

// response interceptor
service.interceptors.response.use((response) => {
  return response.data
}, err)

const err = (error) => {
  if (error.response) {
    const data = error.response.data
    const token = storage.get(ACCESS_TOKEN)
    if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      notification.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed'
      })
      if (token) {
		  store.dispatch('resetToken').then(() => {
		    location.reload()
			/* setTimeout(() => {
			  window.location.reload()
			}, 1500) */
		  })
      }
    }
  }
  return Promise.reject(error)
}


// response 拦截器
/* service.interceptors.response.use(
  response => {
    const res = response.data

    // 状态码判定
    if (res.code !== 20000) {
      message.error(res.message || 'Error', 5 * 1000)
      // 50008: 非法令牌; 50012: 其他客户端登录; 50014: 令牌过期;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        Modal.confirm('您已注销，您可以取消以停留在此页，或重新登录', '确认注销', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    message.error(error.message, 5 * 1000)
    return Promise.reject(error)
  }
) */

export default service
