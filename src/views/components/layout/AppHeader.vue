<script setup lang="ts">
import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import { env } from '@/config/env'
import { activeCycle, currentUser } from '@/config/shell'
import AppTopNav from './AppTopNav.vue'
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
  >
    <div
      class="h-1 w-full bg-linear-to-r from-primary-container via-primary-container to-secondary"
    />

    <div class="flex h-20 w-full items-center justify-between gap-space-md px-gutter-desktop">
      <div class="flex items-center gap-space-lg">
        <div class="flex items-center gap-space-sm">
          <div
            class="flex size-10 items-center justify-center rounded-sm bg-primary-container text-on-primary shadow-sm"
          >
            <MaterialIcon name="account_balance" class="text-[24px]" />
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-space-xs">
              <span
                class="font-headline-md text-headline-md font-bold tracking-tight text-on-surface"
              >
                {{ env.appTitle }}
              </span>
              <BaseBadge size="sm" class="tracking-wider whitespace-nowrap uppercase">
                v{{ env.appVersion }} {{ env.appStage }}
              </BaseBadge>
            </div>
            <span class="line-clamp-1 font-body-sm text-body-sm text-on-surface-variant">
              {{ env.orgName }} • {{ env.orgUnit }}
            </span>
          </div>
        </div>

        <div
          class="hidden items-center gap-space-xs rounded-lg bg-surface-container-low px-space-md py-space-xs xl:flex"
        >
          <span class="size-2 animate-pulse rounded-full bg-secondary" aria-hidden="true" />
          <span class="font-label-strong text-label-strong text-on-surface-variant uppercase">
            Active Cycle:
          </span>
          <span class="font-label-numeric text-label-numeric font-semibold text-secondary">
            {{ activeCycle.label }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-space-md">
        <div class="hidden h-6 w-px bg-outline-variant sm:block" aria-hidden="true" />
        <button
          type="button"
          aria-label="Notifications"
          class="rounded-sm p-space-xs text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <MaterialIcon name="notifications" class="text-[20px]" />
        </button>
        <button
          type="button"
          aria-label="Settings"
          class="rounded-sm p-space-xs text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <MaterialIcon name="settings" class="text-[20px]" />
        </button>
        <div class="flex items-center gap-space-sm pl-space-xs">
          <div class="hidden flex-col text-right lg:flex">
            <span class="font-label-strong text-label-strong font-semibold text-on-surface">
              {{ currentUser.name }}
            </span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">
              {{ currentUser.role }}
            </span>
          </div>
          <div class="flex size-8 items-center justify-center rounded-full bg-primary">
            <MaterialIcon name="person" class="text-[18px] text-on-primary" />
          </div>
        </div>
      </div>
    </div>

    <AppTopNav />
  </header>
</template>
