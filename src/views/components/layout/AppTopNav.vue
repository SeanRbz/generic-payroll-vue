<script setup lang="ts">
import { topNavItems } from '@/config/navigation'
import NavLink from './NavLink.vue'
</script>

<template>
  <nav
    aria-label="Sections"
    class="flex h-10 w-full items-center gap-space-xs overflow-x-auto bg-surface-container-low px-gutter-desktop shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
  >
    <NavLink v-for="item in topNavItems" :key="item.id" :to="item.to">
      {{ item.label }}
    </NavLink>
  </nav>
</template>
