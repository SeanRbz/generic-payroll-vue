import { nextTick, onBeforeUnmount, watch, type Ref, type ShallowRef } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

interface DialogBehaviorOptions {
  open: Readonly<Ref<boolean>>
  panel: Readonly<ShallowRef<HTMLElement | null>>
  onClose: () => void
}

/** Focus management, Tab trapping, Escape-to-close and body scroll lock for a modal dialog. */
export function useDialogBehavior({ open, panel, onClose }: DialogBehaviorOptions) {
  let engaged = false
  let returnFocusTo: HTMLElement | null = null
  let previousOverflow = ''

  function engage() {
    if (engaged) return
    engaged = true
    returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    nextTick(() => panel.value?.focus())
  }

  function release() {
    if (!engaged) return
    engaged = false
    document.body.style.overflow = previousOverflow
    returnFocusTo?.focus()
    returnFocusTo = null
  }

  watch(
    open,
    (isOpen) => {
      if (isOpen) engage()
      else release()
    },
    { immediate: true },
  )
  onBeforeUnmount(release)

  function trapFocus(event: KeyboardEvent) {
    const container = panel.value
    if (!container) return

    const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) {
      event.preventDefault()
      container.focus()
      return
    }

    const active = document.activeElement
    if (event.shiftKey && (active === first || active === container)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
    } else if (event.key === 'Tab') {
      trapFocus(event)
    }
  }

  return { onKeydown }
}
