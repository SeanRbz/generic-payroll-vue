<script setup lang="ts">
import { RouterLink } from 'vue-router'

type NavLinkVariant = 'tab' | 'sidebar' | 'sidebar-child'

const { variant = 'tab' } = defineProps<{
  to: string
  variant?: NavLinkVariant
}>()

const baseClass: Record<NavLinkVariant, string> = {
  tab: 'rounded-sm px-space-md py-1 whitespace-nowrap transition-all',
  sidebar: 'flex items-center gap-space-sm rounded-sm px-space-md py-2 transition-all',
  'sidebar-child': 'flex items-center gap-space-xs rounded-sm px-space-sm py-1.5 transition-all',
}

const activeClass: Record<NavLinkVariant, string> = {
  tab: 'bg-primary-container font-semibold text-on-primary shadow-sm',
  sidebar: 'bg-primary-container font-semibold text-on-primary',
  'sidebar-child': 'bg-primary-container font-semibold text-on-primary',
}

const inactiveClass: Record<NavLinkVariant, string> = {
  tab: 'font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
  sidebar:
    'font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
  'sidebar-child':
    'font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
}
</script>

<template>
  <RouterLink v-slot="{ href, navigate, isActive }" :to="to" custom>
    <a
      :href="href"
      :aria-current="isActive ? 'page' : undefined"
      :class="[baseClass[variant], isActive ? activeClass[variant] : inactiveClass[variant]]"
      @click="navigate"
    >
      <slot />
    </a>
  </RouterLink>
</template>
