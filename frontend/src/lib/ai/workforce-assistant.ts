import * as aiApi from '@/lib/api/ai-insights-api'
import * as attendanceApi from '@/lib/api/attendance-api'
import * as leaveApi from '@/lib/api/leave-api'
import * as payrollApi from '@/lib/api/payroll-api'
import { ApiError } from '@/lib/api/http'
import type { AttendanceRecord } from '@/types/hr'

export type AssistantContext = {
  employeeId: number | null
  employeeName: string | null
  isHrOrAdmin: boolean
  isManager: boolean
  canViewTeamInsights: boolean
}

type Intent = 'attrition' | 'engagement' | 'skills' | 'workforce' | 'attendance' | 'leave' | 'payroll' | 'help'

function detectIntent(query: string): Intent {
  const q = query.toLowerCase()
  if (/attrition|turnover|retention|risk|churn/.test(q)) return 'attrition'
  if (/engagement|morale|motivation|satisfaction/.test(q)) return 'engagement'
  if (/skill|training|gap|upskill|learning|certification/.test(q)) return 'skills'
  if (/workforce|analytics|overview|dashboard|insight|department|engineering|sales/.test(q)) {
    return 'workforce'
  }
  if (/attendance|clock|present|absent|check.?in/.test(q)) return 'attendance'
  if (/leave|vacation|pto|time off|holiday/.test(q)) return 'leave'
  if (/payroll|payslip|salary|compensation|pay/.test(q)) return 'payroll'
  if (/help|what can|how do/.test(q)) return 'help'
  return 'workforce'
}

function formatAttendanceSummary(records: AttendanceRecord[], name: string): string {
  if (records.length === 0) {
    return `No attendance records found for ${name} yet. Use the Attendance page to check in.`
  }
  const recent = records.slice(0, 10)
  const present = recent.filter((r) => r.status === 'PRESENT' || r.clockIn).length
  const lines = recent.map((r) => {
    const date = r.workDate ?? '—'
    const status = r.status ?? (r.clockIn ? 'PRESENT' : '—')
    return `• ${date}: ${status}${r.clockIn ? ` (in ${r.clockIn.slice(11, 16)})` : ''}`
  })
  return [
    `Attendance summary for ${name} (last ${recent.length} records)`,
    `Present/active days in sample: ${present}/${recent.length}`,
    '',
    lines.join('\n'),
    '',
    '_Tip: Open **Attendance** in the sidebar for check-in/out._',
  ].join('\n')
}

function teamAccessDenied(intent: string): string {
  return [
    `Team-level **${intent}** insights require an **HR**, **Manager**, or **Admin** role.`,
    '',
    'For this demo, sign in as `hr@nexushr.com` or `manager@nexushr.com` (password `NexusHR@2026`), or ask about **your attendance**, **leave balance**, or **payslips**.',
    '',
    'HR users can also open **Workforce Intelligence** for full charts and reports.',
  ].join('\n')
}

function helpMessage(ctx: AssistantContext): string {
  const personal = [
    '• **Attendance** — “How is my attendance?”',
    '• **Leave** — “Show my leave balance”',
    '• **Payroll** — “Do I have payslips?”',
  ]
  const team = [
    '• **Attrition** — “Show attrition risk for the team”',
    '• **Engagement** — “Team engagement scores”',
    '• **Skills** — “Recommend training for skill gaps”',
    '• **Workforce** — “Workforce analytics overview”',
  ]
  return [
    'I answer using **live data** from NexusHR services (not a generic chatbot).',
    '',
    ctx.canViewTeamInsights ? '**You can ask (team + personal):**' : '**You can ask (personal):**',
    ...(ctx.canViewTeamInsights ? team : []),
    ...personal,
    '',
    ctx.canViewTeamInsights
      ? '_Enable OpenAI in ai-insights-service for AI-written narratives on top of these insights._'
      : '_Ask your HR team for org-wide attrition and engagement reports._',
  ].join('\n')
}

export async function answerWorkforceQuestion(
  query: string,
  ctx: AssistantContext,
): Promise<string> {
  const intent = detectIntent(query)

  try {
    if (intent === 'help') return helpMessage(ctx)

    if (intent === 'attrition') {
      if (!ctx.canViewTeamInsights) return teamAccessDenied('attrition')
      const data = await aiApi.fetchTeamAttrition()
      const top = data.predictions
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5)
      const lines = top.map(
        (p) =>
          `• **${p.employeeName}** — ${p.riskLevel} risk (${p.riskScore}/100)${p.department ? ` · ${p.department}` : ''}`,
      )
      return [
        `**Team attrition snapshot** (${data.employeeCount} employees)`,
        `High risk: **${data.highRiskCount}** · Medium: **${data.mediumRiskCount}**`,
        '',
        'Top risks:',
        lines.length ? lines.join('\n') : 'No elevated risks in current data.',
        '',
        data.predictions[0]?.aiSummary
          ? `_Insight: ${data.predictions[0].aiSummary.slice(0, 280)}…_`
          : '_Open **Workforce Intelligence → Attrition** for full detail._',
      ].join('\n')
    }

    if (intent === 'engagement') {
      if (!ctx.canViewTeamInsights) return teamAccessDenied('engagement')
      const data = await aiApi.fetchTeamEngagement()
      const low = data.scores
        .filter((s) => s.engagementLevel === 'LOW')
        .slice(0, 4)
        .map((s) => `• ${s.employeeName}: **${s.engagementScore}** (${s.engagementLevel})`)
      return [
        `**Team engagement** (avg **${data.averageEngagementScore.toFixed(0)}/100**)`,
        `High: **${data.highEngagementCount}** · Low: **${data.lowEngagementCount}**`,
        '',
        low.length ? `Needs attention:\n${low.join('\n')}` : 'No low-engagement employees flagged.',
      ].join('\n')
    }

    if (intent === 'skills') {
      if (!ctx.canViewTeamInsights) return teamAccessDenied('skill gap')
      const data = await aiApi.fetchTeamSkillGaps()
      const topGaps = data.analyses
        .flatMap((a) => a.gaps.map((g) => ({ ...g, employeeName: a.employeeName })))
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 5)
        .map((g) => `• **${g.skill}** (${g.employeeName}) — gap ${g.gap.toFixed(1)}, ${g.priority} priority`)
      return [
        `**Skill gap analysis** — ${data.employeesWithGaps}/${data.employeeCount} employees with gaps (${data.totalGapCount} total)`,
        '',
        topGaps.length ? 'Priority development areas:\n' + topGaps.join('\n') : 'No skill gaps recorded.',
        '',
        '_See **Workforce Intelligence → Skill gaps** for development plans._',
      ].join('\n')
    }

    if (intent === 'workforce') {
      if (!ctx.canViewTeamInsights) return teamAccessDenied('workforce')
      const data = await aiApi.fetchWorkforceAnalytics()
      const depts = data.departmentBreakdown
        .slice(0, 4)
        .map((d) => `• ${d.department}: ${d.activeCount}/${d.employeeCount} active`)
      return [
        '**Workforce analytics overview**',
        `Employees: **${data.activeEmployees}** active / ${data.totalEmployees} total`,
        `Pending leave requests: **${data.pendingLeaveRequests}**`,
        `Attrition risk — High: **${data.highAttritionRisk}**, Medium: **${data.mediumAttritionRisk}**`,
        `Avg engagement: **${data.averageEngagementScore.toFixed(0)}/100** · Skill gaps: **${data.totalSkillGaps}**`,
        '',
        depts.length ? 'Departments:\n' + depts.join('\n') : '',
      ]
        .filter(Boolean)
        .join('\n')
    }

    if (intent === 'attendance') {
      if (ctx.canViewTeamInsights && /team|department|all|company|workforce|q1|quarter|trend/.test(query.toLowerCase())) {
        const data = await aiApi.fetchTeamEngagement()
        const lowAttendance = data.scores
          .filter((s) => s.scoreFactors.some((f) => f.toLowerCase().includes('attendance')))
          .slice(0, 4)
        return [
          '**Attendance-related signals** (from engagement scoring):',
          `Team avg engagement: **${data.averageEngagementScore.toFixed(0)}/100**`,
          '',
          lowAttendance.length
            ? lowAttendance.map((s) => `• ${s.employeeName}: ${s.scoreFactors.find((f) => f.includes('Attendance')) ?? 'Review attendance'}`).join('\n')
            : 'No attendance concerns flagged in recent engagement scores.',
        ].join('\n')
      }
      if (!ctx.employeeId) {
        return 'Link your account to an employee profile (Profile & Settings) to see personal attendance.'
      }
      const records = await attendanceApi.fetchAttendanceHistory(ctx.employeeId)
      return formatAttendanceSummary(records, ctx.employeeName ?? 'you')
    }

    if (intent === 'leave') {
      if (!ctx.employeeId) {
        return 'Link your account to an employee profile to view leave balances.'
      }
      const [balances, requests] = await Promise.all([
        leaveApi.fetchLeaveBalances(ctx.employeeId),
        leaveApi.fetchLeavesByEmployee(ctx.employeeId),
      ])
      const balLines = balances.map((b) => `• ${b.leaveType}: ${b.remainingDays} / ${b.entitledDays} days left`)
      const pending = requests.filter((r) => r.status === 'PENDING').length
      return [
        `**Leave summary for ${ctx.employeeName ?? 'you'}**`,
        '',
        balLines.length ? balLines.join('\n') : 'No leave balances configured.',
        '',
        `Recent requests: **${requests.length}** (${pending} pending)`,
        '_Apply for leave from the **Leave** page._',
      ].join('\n')
    }

    if (intent === 'payroll') {
      if (!ctx.employeeId) {
        return 'Link your account to an employee profile to view payslips.'
      }
      const payslips = await payrollApi.fetchPayslips(ctx.employeeId)
      if (payslips.length === 0) {
        return 'No payslips generated yet. HR runs payroll from **Payroll Ops**.'
      }
      const recent = payslips.slice(0, 3)
      const lines = recent.map(
        (p) => `• ${p.payYear}-${String(p.payMonth).padStart(2, '0')}: ${p.netPay} ${p.currency} (${p.status})`,
      )
      return [`**Recent payslips** (${payslips.length} total)`, '', lines.join('\n')].join('\n')
    }

    return helpMessage(ctx)
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 403) return teamAccessDenied(intent)
      if (err.status === 502 || err.status === 503) {
        return `Service unavailable (${err.message}). Ensure ai-insights, attendance, leave, and payroll services are running.`
      }
      return err.message
    }
    return 'Something went wrong fetching workforce data. Try again or open the relevant page in the sidebar.'
  }
}

export function suggestedPrompts(ctx: AssistantContext): string[] {
  if (ctx.canViewTeamInsights) {
    return [
      'Show attrition risk for the team',
      'Team engagement scores',
      'Recommend training for skill gaps',
      'Workforce analytics overview',
    ]
  }
  return [
    'How is my attendance?',
    'Show my leave balance',
    'Do I have payslips?',
    'What can you help me with?',
  ]
}
