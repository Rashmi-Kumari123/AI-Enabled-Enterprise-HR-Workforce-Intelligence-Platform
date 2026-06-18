import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/lib/api/auth-api'
import * as employeeApi from '@/lib/api/employee-api'
import { ApiError } from '@/lib/api/http'

const LIVE_REFETCH_MS = 30_000

export function useEmployeeProfile() {
  const queryClient = useQueryClient()

  const accountQuery = useQuery({
    queryKey: ['auth-account'],
    queryFn: () => authApi.fetchCurrentUser(),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })

  const profileQuery = useQuery({
    queryKey: ['employee-profile'],
    queryFn: () => employeeApi.fetchMyProfile(),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })

  const account = accountQuery.data
  const profile = profileQuery.data
  const employeeId = profile?.id

  const profileLinked =
    Boolean(profile && account) &&
    profile!.userId === account!.id &&
    profile!.email.toLowerCase() === account!.email.toLowerCase()

  const onboardingQuery = useQuery({
    queryKey: ['onboarding-status', employeeId],
    queryFn: () => employeeApi.fetchOnboardingStatus(employeeId!),
    enabled: Boolean(employeeId),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })

  const documentsQuery = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: () => employeeApi.fetchEmployeeDocuments(employeeId!),
    enabled: Boolean(employeeId),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })

  const updateMutation = useMutation({
    mutationFn: (phone: string) => employeeApi.updateMyProfile({ phone }),
    onSuccess: (data) => {
      queryClient.setQueryData(['employee-profile'], data)
    },
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType: string }) =>
      employeeApi.uploadEmployeeDocument(employeeId!, file, documentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] })
      queryClient.invalidateQueries({ queryKey: ['onboarding-status', employeeId] })
      queryClient.invalidateQueries({ queryKey: ['onboarding-pipeline'] })
    },
  })

  const profileError =
    profileQuery.error instanceof ApiError
      ? profileQuery.error.message
      : profileQuery.isError
        ? 'Failed to load employee profile'
        : null

  return {
    account,
    profile,
    onboarding: onboardingQuery.data,
    documents: documentsQuery.data ?? [],
    isLoading: accountQuery.isLoading || profileQuery.isLoading,
    profileMissing: profileQuery.isError && profileQuery.error instanceof ApiError && profileQuery.error.status === 404,
    profileError,
    profileLinked,
    roles: account?.roles.map((r) => r.replace('ROLE_', '')).join(', ') ?? '—',
    updatePhone: updateMutation.mutateAsync,
    uploadDocument: uploadMutation.mutateAsync,
    isSaving: updateMutation.isPending,
    isUploading: uploadMutation.isPending,
    saveError: updateMutation.error instanceof ApiError ? updateMutation.error.message : null,
    uploadError: uploadMutation.error instanceof ApiError ? uploadMutation.error.message : null,
    refetch: () => {
      accountQuery.refetch()
      profileQuery.refetch()
      onboardingQuery.refetch()
      documentsQuery.refetch()
    },
  }
}
