<script setup lang="ts">
import { RouterLink } from 'vue-router'

import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import BaseButton from '@/views/components/ui/BaseButton.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import type { CycleHeader } from '@/models/cycle-overview/types'

defineProps<{ header: CycleHeader }>()
</script>

<template>
  <header class="flex flex-col gap-space-md">
    <nav aria-label="Breadcrumb">
      <ol
        class="flex flex-wrap items-center gap-1 font-label-code text-label-code text-on-surface-variant"
      >
        <li
          v-for="(crumb, index) in header.breadcrumb"
          :key="crumb"
          class="flex items-center gap-1"
        >
          <MaterialIcon v-if="index > 0" name="chevron_right" class="text-[14px] text-outline" />
          <span
            :class="index === header.breadcrumb.length - 1 ? 'font-semibold text-primary' : ''"
            :aria-current="index === header.breadcrumb.length - 1 ? 'page' : undefined"
          >
            {{ crumb }}
          </span>
        </li>
      </ol>
    </nav>

    <div class="flex flex-col justify-between gap-space-md xl:flex-row xl:items-end">
      <div class="max-w-3xl">
        <BaseBadge
          :tone="header.statusTone"
          size="sm"
          pill
          dot
          class="mb-1 tracking-wider uppercase"
        >
          {{ header.statusLabel }}
        </BaseBadge>
        <h1 class="font-headline-xl text-headline-xl tracking-tight text-on-surface">
          {{ header.title }}
        </h1>
        <p class="mt-0.5 font-body-md text-body-md text-on-surface-variant">
          {{ header.coverage }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-space-sm">
        <BaseButton variant="outline" size="sm" class="font-semibold">
          <MaterialIcon name="refresh" class="text-[18px]" />
          Re-run Biometric DTR
        </BaseButton>
        <BaseButton variant="outline" size="sm" class="font-semibold">
          <MaterialIcon name="fact_check" class="text-[18px]" />
          DTR Form 48 Audit
        </BaseButton>
        <BaseButton variant="outline" size="sm" class="font-semibold">
          <MaterialIcon name="picture_as_pdf" class="text-[18px]" />
          Export Summary PDF
        </BaseButton>
        <RouterLink
          to="/batch-generator"
          class="inline-flex h-10 items-center justify-center gap-space-xs rounded-sm bg-primary-container px-3 text-body-sm font-medium text-on-primary transition-all hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container"
        >
          Batch Generator
          <MaterialIcon name="arrow_forward" class="text-[18px]" />
        </RouterLink>
      </div>
    </div>
  </header>
</template>
