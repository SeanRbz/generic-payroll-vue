<script setup lang="ts">
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'

type IconBox = 'none' | 'success' | 'soft'

const {
  iconBox = 'none',
  subtitleTone = 'muted',
  truncateSubtitle = false,
} = defineProps<{
  icon: string
  title: string
  subtitle: string
  trailingIcon: string
  iconBox?: IconBox
  subtitleTone?: 'muted' | 'success'
  truncateSubtitle?: boolean
}>()

const iconBoxClass: Record<IconBox, string> = {
  none: '',
  success: 'size-7 rounded-sm bg-secondary-container text-on-secondary-container',
  soft: 'size-7 rounded-sm bg-surface-container-high text-primary',
}
</script>

<template>
  <button
    type="button"
    class="group flex items-center gap-space-sm rounded-sm bg-surface-container px-space-md py-2.5 shadow-sm transition-all hover:bg-surface-container-high"
  >
    <span class="flex items-center justify-center" :class="iconBoxClass[iconBox]">
      <MaterialIcon
        :name="icon"
        :class="
          iconBox === 'none'
            ? 'text-[20px] text-primary transition-transform group-hover:scale-105'
            : 'text-[18px]'
        "
      />
    </span>
    <span class="flex flex-col text-left">
      <span class="flex items-center gap-1">
        <span class="font-label-strong text-label-strong text-on-surface">{{ title }}</span>
        <slot name="title-extra" />
      </span>
      <span
        class="-mt-0.5 font-label-code text-label-code"
        :class="[
          subtitleTone === 'success' ? 'font-semibold text-secondary' : 'text-on-surface-variant',
          truncateSubtitle && 'max-w-[190px] truncate',
        ]"
      >
        {{ subtitle }}
      </span>
    </span>
    <MaterialIcon :name="trailingIcon" class="ml-1 text-[16px] text-outline" />
  </button>
</template>
