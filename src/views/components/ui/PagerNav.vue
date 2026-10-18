<script setup lang="ts">
import { computed } from 'vue'

import { buildPageList } from '@/utils/pagination'
import MaterialIcon from './MaterialIcon.vue'

const {
  page,
  pageCount,
  label = 'Pagination',
} = defineProps<{
  page: number
  pageCount: number
  label?: string
}>()

const pages = computed(() => buildPageList(page, pageCount))
const isFirstPage = computed(() => page <= 1)
const isLastPage = computed(() => page >= pageCount)

const iconButtonClass =
  'rounded-sm p-1.5 text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:hover:bg-transparent'
</script>

<template>
  <nav :aria-label="label" class="flex items-center gap-1">
    <button type="button" :class="iconButtonClass" aria-label="First page" :disabled="isFirstPage">
      <MaterialIcon name="first_page" class="text-[18px]" />
    </button>
    <button
      type="button"
      :class="iconButtonClass"
      aria-label="Previous page"
      :disabled="isFirstPage"
    >
      <MaterialIcon name="chevron_left" class="text-[18px]" />
    </button>
    <div class="flex items-center gap-1 px-space-xs font-label-numeric text-label-numeric">
      <template v-for="(item, index) in pages" :key="`${item}-${index}`">
        <span v-if="item === 'ellipsis'" class="px-1 text-outline" aria-hidden="true">...</span>
        <button
          v-else
          type="button"
          class="size-7 rounded-sm"
          :class="
            item === page
              ? 'bg-primary-container font-bold text-on-primary'
              : 'text-on-surface hover:bg-surface-container'
          "
          :aria-label="`Page ${item}`"
          :aria-current="item === page ? 'page' : undefined"
        >
          {{ item }}
        </button>
      </template>
    </div>
    <button type="button" :class="iconButtonClass" aria-label="Next page" :disabled="isLastPage">
      <MaterialIcon name="chevron_right" class="text-[18px]" />
    </button>
    <button type="button" :class="iconButtonClass" aria-label="Last page" :disabled="isLastPage">
      <MaterialIcon name="last_page" class="text-[18px]" />
    </button>
  </nav>
</template>
