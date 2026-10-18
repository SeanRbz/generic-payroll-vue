<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ title: string; subtitle?: string }>()

const titleId = useId()
</script>

<template>
  <section
    :aria-labelledby="titleId"
    class="flex flex-col rounded-lg bg-surface-container-lowest p-space-md shadow-sm"
  >
    <header class="mb-space-md flex items-start justify-between gap-space-sm">
      <div>
        <h2 :id="titleId" class="font-headline-md text-headline-md text-on-surface">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="font-body-sm text-body-sm text-on-surface-variant">
          {{ subtitle }}
        </p>
      </div>
      <slot name="badge" />
    </header>

    <div class="flex-1">
      <slot />
    </div>

    <div v-if="$slots.footer" class="mt-space-md">
      <slot name="footer" />
    </div>

    <details v-if="$slots.table" class="mt-space-md border-t border-outline-variant/40 pt-space-sm">
      <summary class="cursor-pointer font-label-code text-label-code text-primary select-none">
        View as table
      </summary>
      <div class="mt-space-xs overflow-x-auto">
        <slot name="table" />
      </div>
    </details>
  </section>
</template>
