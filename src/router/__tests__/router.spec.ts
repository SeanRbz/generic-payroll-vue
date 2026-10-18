import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'

import App from '@/App.vue'
import { env } from '@/config/env'
import { DEFAULT_ROUTE_PATH, navRoutes } from '@/config/navigation'
import { createAppRouter, implementedViews } from '@/router'

function createTestRouter() {
  return createAppRouter(createMemoryHistory())
}

describe('app router', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redirects the root and unknown paths to the landing page', async () => {
    const router = createTestRouter()

    await router.push('/')
    expect(router.currentRoute.value.path).toBe(DEFAULT_ROUTE_PATH)

    await router.push('/does-not-exist')
    expect(router.currentRoute.value.path).toBe(DEFAULT_ROUTE_PATH)
  })

  it('renders the cycle overview when the app opens at the root', async () => {
    const router = createTestRouter()
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.get('main h1').text()).toBe('Active Disbursement Cycle')
    expect(wrapper.get('nav[aria-label="Sections"] a[aria-current="page"]').text()).toBe(
      'Cycle Overview',
    )
  })

  it('serves every navigation path exactly once', () => {
    const router = createTestRouter()
    const paths = navRoutes.map((item) => item.to)

    expect(new Set(paths).size).toBe(paths.length)
    for (const path of paths) {
      expect(router.resolve(path).matched).toHaveLength(1)
    }
  })

  it('maps every unbuilt module to the same Coming Soon view', () => {
    const router = createTestRouter()
    const component = (path: string) => router.resolve(path).matched[0]?.components?.default
    const unbuilt = navRoutes.filter((item) => !(item.to in implementedViews))
    const [first] = unbuilt

    expect(first).toBeDefined()
    for (const item of unbuilt) {
      expect(component(item.to)).toBe(component(first!.to))
    }
    for (const [path, view] of Object.entries(implementedViews)) {
      expect(component(path)).toBe(view)
      expect(component(path)).not.toBe(component(first!.to))
    }
  })

  it('updates the document title from the route', async () => {
    const router = createTestRouter()
    await router.push('/cycle-overview')
    expect(document.title).toBe(`Cycle Overview · ${env.appTitle}`)
  })

  it('renders the Coming Soon screen and highlights the active tab', async () => {
    const router = createTestRouter()
    await router.push('/audit-trail-and-logs')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.get('main h1').text()).toBe('Audit Trail & Logs')
    expect(wrapper.text()).toContain('Coming Soon')
    expect(wrapper.get('nav[aria-label="Sections"] a[aria-current="page"]').text()).toBe(
      'Audit Trail & Logs',
    )

    const back = wrapper.get('main a[href="/cycle-overview"]')
    expect(back.text()).toContain('Back to Cycle Overview')
  })

  it('renders the batch generator at its own path', async () => {
    const router = createTestRouter()
    await router.push('/batch-generator')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router], stubs: { teleport: true } } })
    await flushPromises()

    expect(wrapper.get('main h1').text()).toBe('Payroll Generator')
    expect(wrapper.text()).not.toContain('Coming Soon')
  })

  it('renders the employee masterlist and highlights its sidebar entry', async () => {
    const router = createTestRouter()
    await router.push('/employee-records')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.get('main h1').text()).toBe('Employee Masterlist & Compensation Directory')
    expect(wrapper.text()).not.toContain('Coming Soon')
    expect(wrapper.get('nav[aria-label="Primary"] a[aria-current="page"]').text()).toContain(
      'Employee Masterlist',
    )
    expect(wrapper.get('nav[aria-label="Primary"]').text()).not.toContain('GSIS')
  })

  it('renders the cycle overview at its own path and highlights its tab', async () => {
    const router = createTestRouter()
    await router.push('/cycle-overview')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.get('main h1').text()).toBe('Active Disbursement Cycle')
    expect(wrapper.text()).not.toContain('Coming Soon')
    expect(wrapper.get('nav[aria-label="Sections"] a[aria-current="page"]').text()).toBe(
      'Cycle Overview',
    )
  })
})
