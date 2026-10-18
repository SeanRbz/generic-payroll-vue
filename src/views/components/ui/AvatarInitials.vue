<script setup lang="ts">
import type { AvatarTone } from '@/types/ui'

const { tone = 'primary-container' } = defineProps<{
  initials: string
  tone?: AvatarTone
}>()

const toneClass: Record<AvatarTone, string> = {
  primary: 'bg-primary text-on-primary',
  'primary-container': 'bg-primary-container text-on-primary',
  secondary: 'bg-secondary text-on-secondary',
  soft: 'bg-surface-container-high text-primary',
  muted: 'bg-surface-container text-on-surface-variant',
}
</script>

<template>
  <div
    class="flex size-8 shrink-0 items-center justify-center rounded-full font-label-code text-[11px] font-bold"
    :class="toneClass[tone]"
    aria-hidden="true"
  >
    {{ initials }}
  </div>
</template>
