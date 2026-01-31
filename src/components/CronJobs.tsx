import { CheckCircle2, Clock, Minus } from 'lucide-react'
import type { CronJob } from '../lib/github'

interface Props {
  jobs: CronJob[]
}

export default function CronJobs({ jobs }: Props) {
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const today = now.toISOString().split('T')[0]

  const aShareJobs = jobs.filter(j => j.id.startsWith('market-') || j.id === 'daily-todo')
  const usJobs = jobs.filter(j => j.id.startsWith('us-'))

  const renderJob = (job: CronJob) => {
    const jobTime = job.nextRun || ''
    const isCompleted = job.lastRun && job.lastRun.includes(today)
    const isPast = jobTime < currentTime && !jobTime.startsWith('0')
    const isCurrent = Math.abs(
      parseInt(jobTime.split(':')[0]) * 60 + parseInt(jobTime.split(':')[1]) -
      (now.getHours() * 60 + now.getMinutes())
    ) <= 5

    return (
      <div
        key={job.id}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors ${
          isCurrent
            ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
            : isCompleted
            ? 'bg-emerald-50 text-emerald-700'
            : isPast
            ? 'bg-slate-50 text-slate-400'
            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
        }`}
        title={job.name}
      >
        {/* Status icon */}
        {isCompleted ? (
          <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
        ) : isCurrent ? (
          <Clock size={12} className="text-indigo-500 animate-pulse flex-shrink-0" />
        ) : (
          <Minus size={12} className="text-slate-300 flex-shrink-0" />
        )}
        <span className="font-mono font-medium">{jobTime}</span>
      </div>
    )
  }

  const completedAShare = aShareJobs.filter(j => j.lastRun && j.lastRun.includes(today)).length
  const completedUS = usJobs.filter(j => j.lastRun && j.lastRun.includes(today)).length

  return (
    <div className="space-y-3">
      {/* A-Share Jobs */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-slate-500">A股</span>
          <span className="text-xs text-slate-400">
            {completedAShare}/{aShareJobs.length}
          </span>
          {/* Mini progress */}
          <div className="flex-1 h-1 bg-slate-100 rounded-full max-w-[80px]">
            <div
              className="h-1 bg-emerald-400 rounded-full transition-all"
              style={{ width: aShareJobs.length > 0 ? `${(completedAShare / aShareJobs.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {aShareJobs.map(renderJob)}
        </div>
      </div>

      {/* US Jobs */}
      {usJobs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500">美股</span>
            <span className="text-xs text-slate-400">
              {completedUS}/{usJobs.length}
            </span>
            <div className="flex-1 h-1 bg-slate-100 rounded-full max-w-[80px]">
              <div
                className="h-1 bg-emerald-400 rounded-full transition-all"
                style={{ width: usJobs.length > 0 ? `${(completedUS / usJobs.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {usJobs.map(renderJob)}
          </div>
        </div>
      )}
    </div>
  )
}
