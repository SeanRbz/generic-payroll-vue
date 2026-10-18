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

/** Employee Masterlist page: the roster, its overview cards, filters and statutory guidelines. */
export function useEmployeeMasterlistViewModel() {
  return {
    masterlistHeader,
    masterlistMetrics,
    employees,
    employeePagination,
    guidelines,
    bureauOptions,
    classificationOptions,
    statutoryStatusOptions,
  }
}
