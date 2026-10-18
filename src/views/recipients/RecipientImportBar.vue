<script setup lang="ts">
import BaseButton from '@/views/components/ui/BaseButton.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
</script>

<template>
  <div class="flex flex-wrap items-center gap-space-sm">
    <BaseButton variant="primary" class="font-semibold">
      <MaterialIcon name="upload_file" class="text-[18px]" />
      Import Excel / CSV
    </BaseButton>
    <BaseButton variant="outline" class="font-semibold">
      <MaterialIcon name="download" class="text-[18px]" />
      Download Template (.xlsx)
    </BaseButton>
    <p class="flex items-center gap-1 font-label-code text-[11px] text-on-surface-variant">
      <MaterialIcon name="info" class="text-[14px] text-outline" />
      Drop .xlsx or .csv employee roster to update or append master list
    </p>
  </div>
</template>
