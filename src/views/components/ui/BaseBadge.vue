<script setup lang="ts">
import type { BadgeTone } from '@/types/ui'

const {
  tone = 'primary',
  size = 'xs',
  pill = false,
  dot = false,
} = defineProps<{
  tone?: BadgeTone
  size?: 'xs' | 'sm'
  pill?: boolean
  dot?: boolean
}>()

const toneClass: Record<BadgeTone, string> = {
  primary: 'bg-surface-container-high text-primary',
  success: 'bg-secondary-container text-on-secondary-container',
  neutral: 'bg-surface-container text-on-surface-variant',
  solid: 'bg-primary-container text-on-primary',
}

const sizeClass = {
  xs: 'px-1.5 py-0.5 text-[10px] leading-tight',
  sm: 'px-2 py-0.5 text-label-code',
} as const
</script>

<template>
  <span
    class="inline-flex items-center gap-1 font-label-code font-bold"
    :class="[toneClass[tone], sizeClass[size], pill ? 'rounded-full' : 'rounded-sm']"
  >
    <span v-if="dot" class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    <slot />
  </span>
</template>
