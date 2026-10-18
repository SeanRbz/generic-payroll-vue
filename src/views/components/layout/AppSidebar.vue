<script setup lang="ts">
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import { sidebarGroups } from '@/config/navigation'
import { serverStatus } from '@/config/shell'
import NavLink from './NavLink.vue'
</script>

<template>
  <aside
    class="fixed top-header bottom-0 left-0 z-40 flex w-sidebar flex-col justify-between overflow-y-auto bg-surface-container-lowest py-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
  >
    <nav aria-label="Primary" class="flex flex-col gap-space-md px-space-sm">
      <section v-for="group in sidebarGroups" :key="group.id" :aria-labelledby="`nav-${group.id}`">
        <h2
          :id="`nav-${group.id}`"
          class="px-space-md py-space-xs font-label-strong text-label-strong tracking-wider text-outline uppercase"
        >
          {{ group.heading }}
        </h2>
        <ul class="flex flex-col gap-0.5">
          <li v-for="item in group.items" :key="item.id">
            <NavLink :to="item.to" variant="sidebar">
              <MaterialIcon :name="item.icon" class="text-[18px]" />
              {{ item.label }}
            </NavLink>
            <ul v-if="item.children" class="flex flex-col gap-0.5 pl-6">
              <li v-for="child in item.children" :key="child.id">
                <NavLink :to="child.to" variant="sidebar-child">
                  <MaterialIcon :name="child.icon" class="text-[16px]" />
                  {{ child.label }}
                </NavLink>
              </li>
            </ul>
          </li>
        </ul>
      </section>
    </nav>

    <dl
      class="mx-space-sm mt-space-md flex flex-col gap-1 rounded-lg bg-surface-container-low px-space-md py-space-sm font-label-code text-label-code"
    >
      <div class="flex items-center justify-between">
        <dt class="font-medium text-on-surface-variant">Server Node</dt>
        <dd class="font-semibold text-secondary">{{ serverStatus.node }}</dd>
      </div>
      <div class="flex items-center justify-between">
        <dt class="font-medium text-on-surface-variant">Encoding Phase</dt>
        <dd class="font-semibold text-primary">{{ serverStatus.encodingPhase }}</dd>
      </div>
    </dl>
  </aside>
</template>
