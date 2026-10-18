<script setup lang="ts">
import type { ButtonVariant } from '@/types/ui'

const {
  variant = 'tonal',
  size = 'md',
  type = 'button',
} = defineProps<{
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
}>()

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary-container text-on-primary hover:brightness-110',
  gradient:
    'bg-linear-to-r from-primary-container to-secondary text-on-primary shadow-sm hover:brightness-110',
  success: 'bg-secondary text-on-secondary shadow-md hover:bg-on-secondary-fixed-variant',
  tonal: 'bg-surface-container text-on-surface hover:bg-surface-container-high',
  surface: 'bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container',
  outline:
    'border border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container-low',
  soft: 'bg-surface-container-high text-primary hover:bg-primary-fixed',
}

const sizeClass = {
  sm: 'h-10 px-3 text-body-sm',
  md: 'px-space-md py-2 text-body-md',
  lg: 'px-space-lg py-2.5 text-body-md',
} as const
</script>

<template>
  <button
    :type="type"
    class="inline-flex items-center justify-center gap-space-xs rounded-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container disabled:pointer-events-none disabled:opacity-50"
    :class="[variantClass[variant], sizeClass[size]]"
  >
    <slot />
  </button>
</template>
