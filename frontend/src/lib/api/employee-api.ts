import { apiConfig } from '@/lib/api/config'
import { fetchAuthedBlob, fetchAuthedJson, fetchAuthedMultipart } from '@/lib/api/authenticated'
import type { EmployeeDocument, EmployeeOnboardingPipeline, EmployeeProfile, OnboardingStatus } from '@/types/hr';
const base = apiConfig.employee
export function fetchMyProfile(): Promise<EmployeeProfile> {
  return fetchAuthedJson(`${base}/api/v1/employees/me`)
}
export function updateMyProfile(payload: { phone: string }): Promise<EmployeeProfile> {
  return fetchAuthedJson(`${base}/api/v1/employees/me`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
export function fetchOnboardingStatus(employeeId: number): Promise<OnboardingStatus> {
  return fetchAuthedJson(`${base}/api/v1/employees/${employeeId}/onboarding`)
}
export function fetchOnboardingPipeline(): Promise<EmployeeOnboardingPipeline[]> {
  return fetchAuthedJson(`${base}/api/v1/employees/onboarding/pipeline`)
}
export function completeOnboardingTask(employeeId: number, taskId: number): Promise<OnboardingStatus> {
  return fetchAuthedJson(`${base}/api/v1/employees/${employeeId}/onboarding/tasks/${taskId}/complete`, {
    method: 'POST',
  })
}
export function offboardEmployee(employeeId: number, reason = 'Offboarded via HR lifecycle'): Promise<EmployeeProfile> {
  return fetchAuthedJson(`${base}/api/v1/employees/${employeeId}/offboard`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}
export function fetchEmployeeDocuments(employeeId: number): Promise<EmployeeDocument[]> {
  return fetchAuthedJson(`${base}/api/v1/employees/${employeeId}/documents`)
}
export function uploadEmployeeDocument(
  employeeId: number,
  file: File,
  documentType = 'IDENTITY',
): Promise<EmployeeDocument> {
  const form = new FormData()
  form.append('file', file)
  form.append('documentType', documentType)
  return fetchAuthedMultipart(`${base}/api/v1/employees/${employeeId}/documents`, form)
}
export function downloadEmployeeDocument(employeeId: number, documentId: number): Promise<Blob> {
  return fetchAuthedBlob(`${base}/api/v1/employees/${employeeId}/documents/${documentId}/download`)
}
export function fetchEmployees(): Promise<EmployeeProfile[]> {
  return fetchAuthedJson(`${base}/api/v1/employees`)
}
export function fetchEmployee(id: number): Promise<EmployeeProfile> {
  return fetchAuthedJson(`${base}/api/v1/employees/${id}`)
}
