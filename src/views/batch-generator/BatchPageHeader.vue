<script setup lang="ts">
import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import BaseButton from '@/views/components/ui/BaseButton.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'

defineProps<{ cycleTag: string }>()
</script>

<template>
  <div class="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
    <div>
      <div class="mb-1 flex items-center gap-space-sm">
        <BaseBadge size="sm" class="tracking-wider uppercase">{{ cycleTag }}</BaseBadge>
      </div>
      <h1 class="font-headline-xl text-headline-xl tracking-tight text-on-surface">
        Payroll Generator
      </h1>
      <p class="mt-0.5 font-body-md text-body-md text-on-surface-variant">
        Automated DTR Processing, Statutory Deductions &amp; Encrypted Payslip Email Dispatch
      </p>
    </div>
    <div class="flex items-center gap-space-sm self-start lg:self-auto">
      <BaseButton variant="surface" size="sm">
        <MaterialIcon name="mark_email_read" class="text-[18px] text-primary" />
        Dry-Run Test (5 Samples)
      </BaseButton>
    </div>
  </div>
</template>
