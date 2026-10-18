import { createRouter, createWebHistory, type RouteRecordRaw, type RouterHistory } from 'vue-router'

import { env } from '@/config/env'
import { DEFAULT_ROUTE_PATH, navRoutes } from '@/config/navigation'

const ComingSoonView = () => import('@/views/pages/ComingSoonView.vue')

/** Paths that have a real screen. Every other navigation path renders ComingSoonView. */
export const implementedViews: Record<string, RouteRecordRaw['component']> = {
  '/cycle-overview': () => import('@/views/pages/CycleOverviewView.vue'),
  '/batch-generator': () => import('@/views/pages/BatchGeneratorView.vue'),
  '/employee-records': () => import('@/views/pages/EmployeeMasterlistView.vue'),
}

export const routes: RouteRecordRaw[] = [
  { path: '/', redirect: DEFAULT_ROUTE_PATH },
  ...navRoutes.map((item): RouteRecordRaw => ({
    path: item.to,
    name: item.id,
    component: implementedViews[item.to] ?? ComingSoonView,
    meta: { title: item.label, icon: item.icon },
  })),
  { path: '/:pathMatch(.*)*', redirect: DEFAULT_ROUTE_PATH },
]

export function createAppRouter(
  history: RouterHistory = createWebHistory(import.meta.env.BASE_URL),
) {
  const router = createRouter({ history, routes, scrollBehavior: () => ({ top: 0 }) })

  router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} · ${env.appTitle}` : env.appTitle
  })

  return router
}
