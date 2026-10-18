<script setup lang="ts">
import MetricsGrid from '@/views/components/ui/MetricsGrid.vue'
import CycleOverviewHeader from '@/views/cycle-overview/CycleOverviewHeader.vue'
import DisbursementMixChart from '@/views/cycle-overview/DisbursementMixChart.vue'
import LostHoursTrendChart from '@/views/cycle-overview/LostHoursTrendChart.vue'
import PersonnelByBureauChart from '@/views/cycle-overview/PersonnelByBureauChart.vue'
import { useCycleOverviewViewModel } from '@/viewmodels/cycle-overview/useCycleOverviewViewModel'

const {
  cycleHeader,
  cycleMetrics,
  bureauHeadcount,
  lostHoursTrend,
  lostHoursBreakdown,
  lostHoursImpact,
  lostHoursImprovement,
  fundAllocations,
  disbursement,
} = useCycleOverviewViewModel()
</script>

<template>
  <div class="flex w-full flex-col">
    <CycleOverviewHeader :header="cycleHeader" class="mb-space-xl" />
    <MetricsGrid :metrics="cycleMetrics" :columns="5" label="Cycle summary" class="mb-space-xl" />
    <div class="grid grid-cols-1 gap-space-md xl:grid-cols-3">
      <PersonnelByBureauChart :bureaus="bureauHeadcount" />
      <LostHoursTrendChart
        :periods="lostHoursTrend"
        :breakdown="lostHoursBreakdown"
        :impact="lostHoursImpact"
        :improvement="lostHoursImprovement"
      />
      <DisbursementMixChart :summary="disbursement" :funds="fundAllocations" />
    </div>
  </div>
</template>
