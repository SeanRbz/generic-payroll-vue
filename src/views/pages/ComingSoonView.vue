<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import { defaultNavItem } from '@/config/navigation'

const route = useRoute()
const title = computed(() => route.meta.title ?? 'This page')
const icon = computed(() => route.meta.icon ?? 'construction')
</script>

<template>
  <section
    aria-labelledby="coming-soon-title"
    class="flex min-h-[60vh] flex-col items-center justify-center gap-space-md text-center"
  >
    <div
      class="flex size-16 items-center justify-center rounded-xl bg-surface-container text-primary"
    >
      <MaterialIcon :name="icon" class="text-[32px]" />
    </div>
    <BaseBadge size="sm" tone="primary" class="tracking-wider uppercase">Coming Soon</BaseBadge>
    <h1 id="coming-soon-title" class="font-headline-lg text-headline-lg text-on-surface">
      {{ title }}
    </h1>
    <p class="max-w-md font-body-md text-body-md text-on-surface-variant">
      This module isn't available in this release yet.
    </p>
    <RouterLink
      :to="defaultNavItem.to"
      class="inline-flex items-center gap-space-xs rounded-sm bg-primary-container px-space-md py-2 text-body-md font-medium text-on-primary transition-all hover:brightness-110"
    >
      <MaterialIcon name="arrow_back" class="text-[18px]" />
      Back to {{ defaultNavItem.label }}
    </RouterLink>
  </section>
</template>
