<script setup lang="ts">
import MetricsGrid from '@/views/components/ui/MetricsGrid.vue'
import EmployeeTable from '@/views/employee-masterlist/EmployeeTable.vue'
import GuidelinesStrip from '@/views/employee-masterlist/GuidelinesStrip.vue'
import MasterlistPageHeader from '@/views/employee-masterlist/MasterlistPageHeader.vue'
import MasterlistToolbar from '@/views/employee-masterlist/MasterlistToolbar.vue'
import { useEmployeeMasterlistViewModel } from '@/viewmodels/employee-masterlist/useEmployeeMasterlistViewModel'

const {
  masterlistHeader,
  masterlistMetrics,
  employees,
  employeePagination,
  guidelines,
  bureauOptions,
  classificationOptions,
  statutoryStatusOptions,
} = useEmployeeMasterlistViewModel()
</script>

<template>
  <div class="flex w-full flex-col">
    <MasterlistPageHeader :header="masterlistHeader" class="mb-space-xl" />
    <MetricsGrid :metrics="masterlistMetrics" label="Workforce summary" class="mb-space-xl" />
    <MasterlistToolbar
      :bureau-options="bureauOptions"
      :classification-options="classificationOptions"
      :statutory-status-options="statutoryStatusOptions"
      class="mb-space-md"
    />
    <EmployeeTable :employees="employees" :pagination="employeePagination" class="mb-space-xl" />
    <GuidelinesStrip :guidelines="guidelines" />
  </div>
</template>
