<script setup lang="ts">
import AvatarInitials from '@/views/components/ui/AvatarInitials.vue'
import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import BaseCheckbox from '@/views/components/ui/BaseCheckbox.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import { formatPeso } from '@/utils/format'
import type { EmployeeRecord } from '@/models/employee-masterlist/types'
import StatutoryAccountCell from './StatutoryAccountCell.vue'

defineProps<{ employee: EmployeeRecord }>()
</script>

<template>
  <tr class="transition-colors hover:bg-surface-container-low/70">
    <td class="px-3 py-3 text-center align-top">
      <BaseCheckbox :label="`Select ${employee.name}`" />
    </td>

    <td class="px-3 py-3 align-top">
      <div class="flex items-start gap-space-sm">
        <AvatarInitials :initials="employee.initials" :tone="employee.avatarTone" />
        <div class="flex min-w-0 flex-col gap-0.5">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="font-body-md text-body-md font-semibold text-on-surface">
              {{ employee.name }}
            </span>
            <BaseBadge :tone="employee.classification.tone">
              {{ employee.classification.label }}
            </BaseBadge>
          </div>
          <span class="font-body-sm text-[11px] text-on-surface-variant">{{
            employee.position
          }}</span>
          <dl
            class="mt-0.5 grid grid-cols-[auto_1fr] gap-x-2 font-label-code text-[10px] text-outline"
          >
            <dt>ID</dt>
            <dd class="font-medium text-on-surface-variant">{{ employee.id }}</dd>
            <dt>Unit</dt>
            <dd>{{ employee.office }}</dd>
            <dt>Grade</dt>
            <dd>{{ employee.grade }}</dd>
          </dl>
        </div>
      </div>
    </td>

    <td class="px-3 py-3 align-top">
      <StatutoryAccountCell icon="account_balance" :account="employee.gsis" />
    </td>
    <td class="px-3 py-3 align-top">
      <StatutoryAccountCell icon="home_work" :account="employee.pagibig" />
    </td>
    <td class="px-3 py-3 align-top">
      <StatutoryAccountCell icon="health_and_safety" :account="employee.philhealth" />
    </td>

    <td class="bg-surface-container-low/40 px-3 py-3 text-right align-top">
      <div class="flex flex-col items-end gap-0.5">
        <span class="font-label-numeric text-headline-md font-bold text-secondary">
          {{ formatPeso(employee.compensation.amount) }}
        </span>
        <span class="font-label-code text-[10px] tracking-wider text-outline uppercase">
          {{ employee.compensation.basis === 'monthly' ? 'Monthly Basic' : 'Daily Rate' }}
        </span>
        <span
          v-if="employee.compensation.pera !== null"
          class="font-label-code text-[11px] font-medium text-secondary"
        >
          PERA: +{{ formatPeso(employee.compensation.pera) }}
        </span>
        <span v-else class="font-label-code text-[11px] text-outline">Non-PERA</span>
      </div>
    </td>

    <td class="px-3 py-3 text-center align-top">
      <div class="flex items-center justify-center gap-1">
        <button
          type="button"
          class="rounded-sm p-1.5 text-primary transition-colors hover:bg-surface-container"
          :aria-label="`Quick edit ${employee.name}`"
          title="Quick Edit"
        >
          <MaterialIcon name="edit" class="text-[18px]" />
        </button>
        <button
          type="button"
          class="rounded-sm p-1.5 text-outline transition-colors hover:bg-surface-container"
          :aria-label="`Audit history for ${employee.name}`"
          title="Audit History"
        >
          <MaterialIcon name="history" class="text-[18px]" />
        </button>
        <button
          type="button"
          class="rounded-sm p-1.5 text-outline transition-colors hover:bg-surface-container"
          :aria-label="`View details for ${employee.name}`"
          title="View Details"
        >
          <MaterialIcon name="more_vert" class="text-[18px]" />
        </button>
      </div>
    </td>
  </tr>
</template>
