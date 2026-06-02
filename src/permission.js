import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register', '/his-exchange']

const isWhiteList = (path) => {
  const matched = whiteList.some(pattern => {
    const result = isPathMatch(pattern, path);
    console.log('[isWhiteList] 检查:', { pattern, path, result });
    return result;
  });
  console.log('[isWhiteList] 最终结果:', { path, matched, whiteList });
  return matched;
}

router.beforeEach((to, from, next) => {
  NProgress.start()
  console.log('[Permission] 路由守卫触发:', {
    to: to.path,
    from: from.path,
    hasToken: !!getToken(),
    isWhiteList: isWhiteList(to.path)
  })

  // 特殊处理：/his-exchange 路径完全不需要登录验证
  if (to.path === '/his-exchange') {
    console.log('[Permission] HIS兑换页面，直接放行')
    next()
    return
  }

  if (getToken()) {
    to.meta.title && store.dispatch('settings/setTitle', to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (isWhiteList(to.path)) {
      // 免登录白名单，直接进入
      console.log('[Permission] 白名单路由，直接通过:', to.path)
      next()
    } else {
      if (store.getters.roles.length === 0) {
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetInfo').then(() => {
          isRelogin.show = false
          store.dispatch('GenerateRoutes').then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            router.addRoutes(accessRoutes) // 动态添加可访问路由表
            // 如果当前路由在白名单中，不使用replace
            if (isWhiteList(to.path)) {
              console.log('[Permission] 白名单路由，不使用replace:', to.path)
              next()
            } else {
              console.log('[Permission] 非白名单路由，使用replace:', to.path)
              next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
            }
          })
        }).catch(err => {
            store.dispatch('LogOut').then(() => {
              Message.error(err)
              next({ path: '/' })
            })
          })
      } else {
        next()
      }
    }
  } else {
    // 没有token
    console.log('[Permission] 无token')
    if (isWhiteList(to.path)) {
      // 在免登录白名单，直接进入
      console.log('[Permission] 白名单路由，直接通过:', to.path)
      next()
    } else {
      console.log('[Permission] 重定向到登录页')
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
