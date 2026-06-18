import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as employeeApi from '@/lib/api/employee-api'
import * as leaveApi from '@/lib/api/leave-api'
import type { LeaveSubmitPayload } from '@/lib/api/leave-api'
import { ApiError } from '@/lib/api/http'

const LIVE_REFETCH_MS = 30_000
const LEAVE_TYPES = ['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'PATERNITY', 'OTHER'] as const
const BALANCE_LABELS: Record<string, string> = {
  ANNUAL: 'Annual Leave',
  SICK: 'Sick Leave',
}
function displayBalances(balances: Awaited<ReturnType<typeof leaveApi.fetchLeaveBalances>>) {
  return balances.map((b) => ({
    type: BALANCE_LABELS[b.leaveType] ?? b.leaveType,
    code: b.leaveType,
    entitled: b.entitledDays,
    used: b.usedDays,
    remaining: b.remainingDays,
  }))
}
export function useLeaveManagement() {
  const queryClient = useQueryClient()
  const profileQuery = useQuery({
    queryKey: ['employee-profile'],
    queryFn: () => employeeApi.fetchMyProfile(),
    retry: false,
  })
  const employeeId = profileQuery.data?.id
  const balancesQuery = useQuery({
    queryKey: ['leave-balances', employeeId],
    queryFn: () => leaveApi.fetchLeaveBalances(employeeId!),
    enabled: Boolean(employeeId),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const leavesQuery = useQuery({
    queryKey: ['leaves', employeeId],
    queryFn: () => leaveApi.fetchLeavesByEmployee(employeeId!),
    enabled: Boolean(employeeId),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const invalidateLeaveData = () => {
    queryClient.invalidateQueries({ queryKey: ['leaves', employeeId] })
    queryClient.invalidateQueries({ queryKey: ['leave-balances', employeeId] })
    queryClient.invalidateQueries({ queryKey: ['pending-leaves'] })
  }
  const submitMutation = useMutation({
    mutationFn: (payload: Omit<LeaveSubmitPayload, 'employeeId'>) =>
      leaveApi.submitLeave({ ...payload, employeeId: employeeId! }),
    onSuccess: invalidateLeaveData,
  })
  const leaves = leavesQuery.data ?? []
  const pending = leaves.filter((l) => l.status === 'PENDING')
  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading || leavesQuery.isLoading || balancesQuery.isLoading,
    leaves,
    pending,
    balances: displayBalances(balancesQuery.data ?? []),
    balancesRaw: balancesQuery.data ?? [],
    leaveTypes: LEAVE_TYPES,
    submitLeave: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error instanceof ApiError ? submitMutation.error.message : null,
    refetch: () => {
      balancesQuery.refetch()
      leavesQuery.refetch()
    },
  }
}
export function useLeaveApprovals() {
  const queryClient = useQueryClient()

  const pendingQuery = useQuery({
    queryKey: ['pending-leaves'],
    queryFn: () => leaveApi.fetchPendingLeaves(),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const approveMutation = useMutation({
    mutationFn: (id: number) => leaveApi.approveLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-leaves'] })
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] })
    },
  })
  const rejectMutation = useMutation({
    mutationFn: (id: number) => leaveApi.rejectLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-leaves'] })
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] })
    },
  })
  return {
    pendingLeaves: pendingQuery.data ?? [],
    isLoading: pendingQuery.isLoading,
    approveLeave: approveMutation.mutateAsync,
    rejectLeave: rejectMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    refetch: pendingQuery.refetch,
  }
}
