<script setup lang="ts">
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import type { Guideline } from '@/models/employee-masterlist/types'

defineProps<{ guidelines: readonly Guideline[] }>()

const toneClass: Record<Guideline['tone'], string> = {
  primary: 'bg-surface-container text-primary',
  success: 'bg-secondary-container text-on-secondary-container',
  neutral: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
}
</script>

<template>
  <section aria-label="Statutory guidelines" class="grid grid-cols-1 gap-space-md lg:grid-cols-3">
    <article
      v-for="guideline in guidelines"
      :key="guideline.id"
      class="flex items-start gap-space-sm rounded-lg bg-surface-container-lowest p-space-md shadow-sm"
    >
      <span
        class="flex size-8 shrink-0 items-center justify-center rounded-sm"
        :class="toneClass[guideline.tone]"
      >
        <MaterialIcon :name="guideline.icon" class="text-[18px]" />
      </span>
      <div>
        <h3 class="font-label-strong text-label-strong tracking-wider text-on-surface uppercase">
          {{ guideline.title }}
        </h3>
        <p class="mt-0.5 font-body-sm text-[11px] text-on-surface-variant">{{ guideline.body }}</p>
      </div>
    </article>
  </section>
</template>
