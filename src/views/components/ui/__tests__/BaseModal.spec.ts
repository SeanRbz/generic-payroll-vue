import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import BaseModal from '../BaseModal.vue'

const mounted: { unmount: () => void }[] = []

function mountModal(open = true) {
  const wrapper = mount(BaseModal, {
    props: { open, title: 'Test dialog', description: 'Dialog description' },
    slots: {
      icon: '<i>icon</i>',
      default: '<p>Dialog body</p>',
      footer: '<button type="button">Footer action</button>',
    },
    attachTo: document.body,
    global: { stubs: { teleport: true } },
  })
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('BaseModal', () => {
  it('renders nothing while closed', () => {
    const wrapper = mountModal(false)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('renders an accessible dialog while open', () => {
    const wrapper = mountModal()
    const dialog = wrapper.get('[role="dialog"]')

    expect(dialog.attributes('aria-modal')).toBe('true')
    const title = document.getElementById(dialog.attributes('aria-labelledby') ?? '')
    expect(title?.textContent?.trim()).toBe('Test dialog')
    const description = document.getElementById(dialog.attributes('aria-describedby') ?? '')
    expect(description?.textContent?.trim()).toBe('Dialog description')
    expect(wrapper.text()).toContain('Dialog body')
  })

  it('emits update:open=false when the close button is clicked', async () => {
    const wrapper = mountModal()
    await wrapper.get('button[aria-label="Close dialog"]').trigger('click')
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('emits update:open=false on Escape', async () => {
    const wrapper = mountModal()
    await wrapper.get('[role="dialog"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('closes on a backdrop press but not on a press inside the panel', async () => {
    const wrapper = mountModal()
    const dialog = wrapper.get('[role="dialog"]')

    await dialog.trigger('mousedown')
    expect(wrapper.emitted('update:open')).toBeUndefined()

    dialog.element.parentElement?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('moves focus into the dialog and locks page scroll while open', async () => {
    const wrapper = mountModal()
    await nextTick()

    expect(document.activeElement).toBe(wrapper.get('[role="dialog"]').element)
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('keeps Tab and Shift+Tab focus inside the dialog', async () => {
    const wrapper = mountModal()
    await nextTick()
    const buttons = wrapper.get('[role="dialog"]').findAll('button')
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (!first || !last) throw new Error('expected focusable buttons in the dialog')

    ;(last.element as HTMLElement).focus()
    await last.trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(first.element)

    await first.trigger('keydown', { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last.element)
  })
})
