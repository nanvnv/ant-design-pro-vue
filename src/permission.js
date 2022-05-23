import router from './router'
import store from './store'
import storage from 'store'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import notification from 'ant-design-vue/es/notification'
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { message } from 'ant-design-vue'

const whiteList = ['login', 'register', 'registerResult', 'auth-redirect'] // no redirect whitelist

const defaultRoutePath = '/dashboard/workplace'

router.beforeEach(async (to, from, next) => {
    NProgress.start() // start progress bar
    to.meta && (typeof to.meta.title !== 'undefined' && setDocumentTitle(`${to.meta.title} - ${domTitle}`))
    if (storage.get(ACCESS_TOKEN)) {
        if (to.path === '/user/login') {
			next({ path: defaultRoutePath })
			NProgress.done()
        } else {
            const hasRoles = store.getters.roles && store.getters.roles.length > 0
            if (hasRoles) {
                next()
            } else {
                try {
                    const { roles } = await store.dispatch('getInfo')
                    const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
                    router.addRoutes(accessRoutes)
                    console.log(to)
                    next({ ...to, replace: true })
                } catch (error) {
                    await store.dispatch('resetToken')
                    //message.error(error || 'Has Error')
					notification.error({
					  message: '错误',
					  description: '请求用户信息失败，请重试'
					})
                    next(`/user/login?redirect=${to.path}`)
                }
            }
        }
    } else {
        if (whiteList.includes(to.name)) {
            next()
        } else {
            next(`/user/login?redirect=${to.path}`)
			NProgress.done()
        }
    }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})