import { describe, expect, it } from 'vitest'

import { employees } from '@/models/employee-masterlist/data/employees'
import {
  classificationOptions,
  statutoryStatusOptions,
} from '@/models/employee-masterlist/data/filters'
import { guidelines } from '@/models/employee-masterlist/data/guidelines'
import {
  employeePagination,
  masterlistHeader,
  masterlistMetrics,
} from '@/models/employee-masterlist/data/masterlistSummary'
import { bureauOptions } from '@/models/shared/organization'
import { useEmployeeMasterlistViewModel } from '../useEmployeeMasterlistViewModel'

describe('useEmployeeMasterlistViewModel', () => {
  it('hands the page the masterlist fixtures as they are', () => {
    const vm = useEmployeeMasterlistViewModel()

    expect(vm.masterlistHeader).toBe(masterlistHeader)
    expect(vm.masterlistMetrics).toBe(masterlistMetrics)
    expect(vm.employees).toBe(employees)
    expect(vm.employeePagination).toBe(employeePagination)
    expect(vm.guidelines).toBe(guidelines)
  })

  it('hands the toolbar its filter options', () => {
    const vm = useEmployeeMasterlistViewModel()

    expect(vm.bureauOptions).toBe(bureauOptions)
    expect(vm.classificationOptions).toBe(classificationOptions)
    expect(vm.statutoryStatusOptions).toBe(statutoryStatusOptions)
  })
})
