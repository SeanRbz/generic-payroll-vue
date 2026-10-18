<script setup lang="ts">
import AvatarInitials from '@/views/components/ui/AvatarInitials.vue'
import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import BaseCheckbox from '@/views/components/ui/BaseCheckbox.vue'
import TableEmptyRow from '@/views/components/ui/TableEmptyRow.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import type { Recipient } from '@/models/recipients/types'

defineProps<{ recipients: readonly Recipient[] }>()

const columns = [
  'Employee ID & Name',
  'Official Email',
  'Bureau / Division',
  'PIN Security',
  'Dispatch Routing',
  'Status',
]
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-outline-variant">
    <table class="w-full min-w-[40rem] border-collapse text-left">
      <caption class="sr-only">
        Employee notification directory
      </caption>
      <thead>
        <tr
          class="bg-surface-container-low font-label-strong text-[10px] tracking-wider text-on-surface-variant uppercase"
        >
          <th scope="col" class="w-10 px-3 py-2.5">
            <BaseCheckbox label="Select all recipients" :checked="recipients.length > 0" />
          </th>
          <th v-for="column in columns" :key="column" scope="col" class="px-3 py-2.5">
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-surface-container-high">
        <TableEmptyRow
          v-if="recipients.length === 0"
          :colspan="7"
          icon="group_off"
          title="No recipients loaded"
          description="Import an Excel or CSV roster to populate the directory."
        />
        <tr
          v-for="recipient in recipients"
          :key="recipient.id"
          class="transition-colors hover:bg-surface-container-low/70"
        >
          <td class="px-3 py-2.5">
            <BaseCheckbox :label="`Select ${recipient.name}`" checked />
          </td>
          <td class="px-3 py-2.5">
            <div class="flex items-center gap-space-sm">
              <AvatarInitials :initials="recipient.initials" :tone="recipient.avatarTone" />
              <div class="flex flex-col">
                <span class="font-body-sm text-body-sm font-semibold text-on-surface">
                  {{ recipient.name }}
                </span>
                <span class="font-label-code text-[10px] whitespace-nowrap text-outline">
                  {{ recipient.id }}
                </span>
              </div>
            </div>
          </td>
          <td class="px-3 py-2.5">
            <div class="flex flex-wrap items-center gap-1">
              <span class="font-label-code text-[11px] text-on-surface">{{ recipient.email }}</span>
              <BaseBadge :tone="recipient.verification.tone">
                {{ recipient.verification.label }}
              </BaseBadge>
            </div>
          </td>
          <td class="px-3 py-2.5 font-label-code text-[11px] text-on-surface-variant">
            {{ recipient.bureau }}
          </td>
          <td class="px-3 py-2.5">
            <span
              class="flex items-center gap-1 font-label-code text-[10px] font-semibold text-secondary"
            >
              <MaterialIcon name="lock" class="text-[14px]" />
              {{ recipient.pinSecurity }}
            </span>
          </td>
          <td class="px-3 py-2.5 font-label-code text-[11px] text-on-surface-variant">
            {{ recipient.routing }}
          </td>
          <td class="px-3 py-2.5">
            <BaseBadge tone="success" pill>{{ recipient.status }}</BaseBadge>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
