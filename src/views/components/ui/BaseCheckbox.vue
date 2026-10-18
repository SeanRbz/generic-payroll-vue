<script setup lang="ts">
defineProps<{
  label: string
  checked?: boolean
}>()
</script>

<template>
  <input
    type="checkbox"
    class="size-4 cursor-pointer rounded-sm accent-primary"
    :checked="checked"
    :aria-label="label"
  />
</template>
