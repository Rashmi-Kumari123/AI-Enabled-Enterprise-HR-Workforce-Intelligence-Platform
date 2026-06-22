export type SignupRole = 'MANAGER' | 'HR' | 'ADMIN'
export const signupRoleOptions: {
  value: SignupRole
  label: string
  description: string
}[] = [
  {
    value: 'MANAGER',
    label: 'Manager',
    description: 'Approve leave, review team performance',
  },
  {
    value: 'HR',
    label: 'HR',
    description: 'Payroll, hiring, workforce analytics',
  },
  {
    value: 'ADMIN',
    label: 'Admin',
    description: 'Full platform configuration and access',
  },
]
