export type SignupRole = 'MANAGER' | 'HR' | 'PAYROLL' | 'IT_ADMIN' | 'ADMIN'

export const signupRoleOptions: {
  value: SignupRole
  label: string
  description: string
}[] = [
  {
    value: 'MANAGER',
    label: 'Department Manager',
    description: 'Approve leave, review team performance',
  },
  {
    value: 'HR',
    label: 'HR Admin',
    description: 'Employees, payroll, workforce analytics',
  },
  {
    value: 'PAYROLL',
    label: 'Payroll Manager',
    description: 'Salary structures, payslips, payroll runs',
  },
  {
    value: 'IT_ADMIN',
    label: 'IT Admin',
    description: 'User accounts, security, audit logs',
  },
  {
    value: 'ADMIN',
    label: 'Super Admin',
    description: 'Full tenant configuration and access',
  },
]

export type HireRole = 'EMPLOYEE' | 'MANAGER' | 'PAYROLL' | 'HR' | 'IT_ADMIN' | 'EXECUTIVE'

export const hireRoleOptions: {
  value: HireRole
  label: string
}[] = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'MANAGER', label: 'Department Manager' },
  { value: 'PAYROLL', label: 'Payroll Manager' },
  { value: 'HR', label: 'HR Admin' },
  { value: 'IT_ADMIN', label: 'IT Admin' },
  { value: 'EXECUTIVE', label: 'CEO / Executive' },
]
