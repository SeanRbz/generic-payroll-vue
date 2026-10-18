<script setup lang="ts">
import AvatarInitials from '@/views/components/ui/AvatarInitials.vue'
import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import BaseCheckbox from '@/views/components/ui/BaseCheckbox.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import { formatNumber, formatPeso } from '@/utils/format'
import type { DeductionLine, LedgerRow } from '@/models/batch-generator/types'

defineProps<{ row: LedgerRow }>()

function deductionText(line: DeductionLine): string {
  return line.segments
    .map((segment) => `${segment.label}: ${formatPeso(segment.amount)}`)
    .join(' • ')
}
</script>

<template>
  <tr class="transition-colors hover:bg-surface-container-low/70">
    <td class="px-3 py-3 text-center">
      <BaseCheckbox :label="`Select ${row.name}`" checked />
    </td>

    <td class="px-3 py-3">
      <div class="flex items-center gap-space-sm">
        <AvatarInitials :initials="row.initials" :tone="row.avatarTone" />
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="font-body-md text-body-md font-semibold text-on-surface">{{
              row.name
            }}</span>
            <BaseBadge :tone="row.gradeTone">{{ row.grade }}</BaseBadge>
          </div>
          <span class="font-label-code text-label-code font-medium text-outline">
            {{ row.id }} • {{ row.office }}
          </span>
          <span class="line-clamp-1 font-body-sm text-[11px] text-on-surface-variant">
            {{ row.position }}
          </span>
        </div>
      </div>
    </td>

    <td class="px-3 py-3">
      <div class="flex flex-col gap-0.5">
        <div
          class="flex items-center gap-1 font-label-numeric text-label-numeric font-semibold text-on-surface"
        >
          <MaterialIcon
            :name="row.attendance.verified ? 'check_circle' : 'pending'"
            class="text-[14px]"
            :class="row.attendance.verified ? 'text-secondary' : 'text-primary'"
          />
          <span>{{ formatNumber(row.attendance.hours, 1) }} hrs</span>
          <span class="font-body-sm text-body-sm font-normal text-on-surface-variant">
            ({{ row.attendance.basis }})
          </span>
        </div>
        <div class="flex items-center gap-space-xs font-label-code text-[11px]">
          <span
            :class="row.attendance.extra.positive ? 'font-medium text-secondary' : 'text-outline'"
          >
            {{ row.attendance.extra.label }}
          </span>
          <span class="text-outline" aria-hidden="true">•</span>
          <span :class="row.attendance.tardy.flagged ? 'font-medium text-error' : 'text-outline'">
            {{ row.attendance.tardy.label }}
          </span>
        </div>
        <span
          class="font-label-code text-[10px]"
          :class="row.attendance.source.verified ? 'font-medium text-secondary' : 'text-outline'"
        >
          {{ row.attendance.source.label }}
        </span>
      </div>
    </td>

    <td class="px-3 py-3">
      <div class="flex flex-col gap-0.5">
        <span class="font-label-code text-label-code font-medium text-on-surface">{{
          row.email
        }}</span>
        <div class="mt-0.5 flex items-center gap-1">
          <BaseBadge tone="success" dot>Verified MX</BaseBadge>
          <span class="font-label-code text-[10px] text-outline">PIN: {{ row.pinRule }}</span>
        </div>
      </div>
    </td>

    <td class="px-3 py-3">
      <div class="flex flex-col gap-0.5 font-label-code text-label-code">
        <div
          v-for="(line, index) in row.statutory"
          :key="line.label"
          class="flex items-center justify-between gap-space-sm"
          :class="index > 0 && 'text-[11px]'"
        >
          <span class="text-outline">{{ line.label }}:</span>
          <span
            v-if="typeof line.value === 'number'"
            class="font-label-numeric font-medium"
            :class="line.muted ? 'text-outline' : 'text-on-surface'"
          >
            {{ formatPeso(line.value) }}
          </span>
          <span v-else class="font-mono text-on-surface-variant">{{ line.value }}</span>
        </div>
      </div>
    </td>

    <td class="px-3 py-3 text-right">
      <div class="flex flex-col items-end gap-0.5">
        <span class="font-label-numeric text-label-numeric font-bold text-on-surface">
          {{ formatPeso(row.deductionTotal) }}
        </span>
        <span
          v-for="line in row.deductionLines"
          :key="deductionText(line)"
          class="font-label-code text-[11px]"
          :class="line.flagged ? 'font-medium text-error' : 'text-outline'"
        >
          {{ deductionText(line) }}
        </span>
      </div>
    </td>

    <td class="bg-surface-container-low/40 px-3 py-3 text-right">
      <div class="flex flex-col items-end gap-0.5">
        <span class="font-label-numeric text-headline-md font-bold text-secondary">
          {{ formatPeso(row.netPay) }}
        </span>
        <BaseBadge tone="success">{{ row.netStatus }}</BaseBadge>
      </div>
    </td>

    <td class="px-3 py-3 text-center">
      <div class="flex items-center justify-center gap-1">
        <button
          type="button"
          class="rounded-sm p-1.5 text-primary transition-colors hover:bg-surface-container"
          :aria-label="`Preview PDF payslip for ${row.name}`"
          title="Preview PDF Slip"
        >
          <MaterialIcon name="visibility" class="text-[18px]" />
        </button>
        <button
          type="button"
          class="rounded-sm p-1.5 text-secondary transition-colors hover:bg-surface-container"
          :aria-label="`Send direct test email to ${row.name}`"
          title="Send Direct Test Email"
        >
          <MaterialIcon name="send" class="text-[18px]" />
        </button>
        <button
          type="button"
          class="rounded-sm p-1.5 text-outline transition-colors hover:bg-surface-container"
          :aria-label="`Audit row logs for ${row.name}`"
          title="Audit Row Logs"
        >
          <MaterialIcon name="history" class="text-[18px]" />
        </button>
      </div>
    </td>
  </tr>
</template>
