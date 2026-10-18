<script setup lang="ts">
import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import BaseButton from '@/views/components/ui/BaseButton.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import type { MasterlistHeader } from '@/models/employee-masterlist/types'

defineProps<{ header: MasterlistHeader }>()
</script>

<template>
  <header class="flex flex-col gap-space-md">
    <div class="flex flex-wrap items-center justify-between gap-space-sm">
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
      <BaseBadge :tone="header.registryTone" size="sm" pill dot class="tracking-wider uppercase">
        {{ header.registryStatus }}
      </BaseBadge>
    </div>

    <div class="flex flex-col justify-between gap-space-md lg:flex-row lg:items-end">
      <div class="max-w-3xl">
        <div class="mb-1 flex items-center gap-space-sm">
          <BaseBadge tone="solid" size="sm" class="tracking-wider">{{
            header.ledgerCode
          }}</BaseBadge>
          <span class="font-label-strong text-label-strong tracking-wider text-outline uppercase">
            {{ header.ledgerLabel }}
          </span>
        </div>
        <h1 class="font-headline-xl text-headline-xl tracking-tight text-on-surface">
          {{ header.title }}
        </h1>
        <p class="mt-0.5 font-body-md text-body-md text-on-surface-variant">
          {{ header.description }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-space-sm self-start lg:self-auto">
        <BaseButton variant="outline" size="sm" class="font-semibold">
          <MaterialIcon name="upload_file" class="text-[18px]" />
          Import Master (.xlsx)
        </BaseButton>
        <BaseButton variant="outline" size="sm" class="font-semibold">
          Export Masterlist
          <MaterialIcon name="expand_more" class="text-[18px]" />
        </BaseButton>
      </div>
    </div>
  </header>
</template>
