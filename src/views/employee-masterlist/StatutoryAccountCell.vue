<script setup lang="ts">
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import type { StatutoryAccount } from '@/models/employee-masterlist/types'

defineProps<{
  icon: string
  account: StatutoryAccount
}>()
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <span
      class="flex items-center gap-1 font-label-numeric text-label-numeric font-semibold whitespace-nowrap"
      :class="account.muted ? 'text-outline' : 'text-on-surface'"
    >
      <MaterialIcon
        :name="icon"
        class="text-[14px]"
        :class="account.muted ? 'text-outline' : 'text-primary'"
      />
      {{ account.number }}
    </span>
    <span
      v-for="detail in account.details"
      :key="detail"
      class="font-label-code text-[10px] text-on-surface-variant"
    >
      {{ detail }}
    </span>
  </div>
</template>
