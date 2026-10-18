<script setup lang="ts">
import { useId, useTemplateRef } from 'vue'

import { useDialogBehavior } from '@/views/composables/useDialogBehavior'
import MaterialIcon from './MaterialIcon.vue'

type ModalSize = 'lg' | 'xl' | '2xl' | '3xl'

const open = defineModel<boolean>('open', { required: true })

const { size = 'xl' } = defineProps<{
  title: string
  description?: string
  size?: ModalSize
}>()

const sizeClass: Record<ModalSize, string> = {
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
}

const titleId = useId()
const descriptionId = useId()
const panel = useTemplateRef<HTMLElement>('panel')

function close() {
  open.value = false
}

const { onKeydown } = useDialogBehavior({ open, panel, onClose: close })
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 p-4 backdrop-blur-xs"
        @mousedown.self="close"
        @keydown="onKeydown"
      >
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          :aria-labelledby="titleId"
          :aria-describedby="description ? descriptionId : undefined"
          class="modal-panel flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-2xl focus:outline-none"
          :class="sizeClass[size]"
        >
          <header
            class="flex items-start justify-between gap-space-md px-space-lg pt-space-lg pb-space-md"
          >
            <div class="flex min-w-0 items-start gap-space-md">
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary shadow-sm"
              >
                <slot name="icon" />
              </div>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-space-sm">
                  <h2
                    :id="titleId"
                    class="font-headline-md text-headline-md font-bold text-on-surface"
                  >
                    {{ title }}
                  </h2>
                  <slot name="badge" />
                </div>
                <p
                  v-if="description"
                  :id="descriptionId"
                  class="font-body-sm text-body-sm text-on-surface-variant"
                >
                  {{ description }}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close dialog"
              class="rounded-sm p-1 text-outline hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary-container"
              @click="close"
            >
              <MaterialIcon name="close" class="text-[20px]" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto px-space-lg">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="px-space-lg py-space-md">
            <slot name="footer" :close="close" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 150ms ease-out;
}

.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 150ms ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal-panel,
  .modal-leave-active .modal-panel {
    transition: none;
  }
}
</style>
