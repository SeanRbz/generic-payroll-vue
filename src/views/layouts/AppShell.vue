<script setup lang="ts">
import AppHeader from '@/views/components/layout/AppHeader.vue'
import AppSidebar from '@/views/components/layout/AppSidebar.vue'
</script>

<template>
  <div class="min-h-screen bg-background">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-sm focus:bg-primary-container focus:px-space-md focus:py-space-xs focus:text-on-primary"
    >
      Skip to main content
    </a>
    <AppHeader />
    <AppSidebar />
    <div class="pl-sidebar">
      <main id="main-content" class="min-h-screen w-full px-gutter-desktop pt-header pb-space-lg">
        <div class="flex w-full flex-col pt-space-lg">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
