import type { CronJob } from '../lib/github'

interface Props {
  jobs: CronJob[]
}

export default function CronJobs({ jobs }: Props) {
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const today = now.toISOString().split('T')[0]
  
  // Separate A-share and US jobs
  const aShareJobs = jobs.filter(j => j.id.startsWith('market-') || j.id === 'daily-todo')
  const usJobs = jobs.filter(j => j.id.startsWith('us-'))
  
  const renderJob = (job: CronJob) => {
    const jobTime = job.nextRun || ''
    const isCompleted = job.lastRun && job.lastRun.includes(today)
    const isPast = jobTime < currentTime && !jobTime.startsWith('0') // Handle overnight US jobs
    const isCurrent = Math.abs(
      parseInt(jobTime.split(':')[0]) * 60 + parseInt(jobTime.split(':')[1]) -
      (now.getHours() * 60 + now.getMinutes())
    ) <= 5
    
    return (
      <div 
        key={job.id}
        className={`p-2 rounded-lg text-center transition text-sm
          ${isCurrent ? 'bg-blue-600 animate-pulse' : 
            isCompleted ? 'bg-green-900/50 text-green-300' :
            isPast ? 'bg-gray-700/50 text-gray-500' : 
            'bg-gray-700 hover:bg-gray-600'}`}
      >
        <div className="font-mono font-bold">
          {jobTime}
        </div>
        <div className="text-xs text-gray-400 truncate">
          {job.name}
        </div>
        {isCompleted && (
          <div className="text-xs text-green-400">✓</div>
        )}
      </div>
    )
  }
  
  const completedAShare = aShareJobs.filter(j => j.lastRun && j.lastRun.includes(today)).length
  const completedUS = usJobs.filter(j => j.lastRun && j.lastRun.includes(today)).length
  
  return (
    <div className="space-y-4">
      {/* A-Share Jobs */}
      <div>
        <h3 className="text-sm text-gray-400 mb-2">
          🇨🇳 A股 ({completedAShare}/{aShareJobs.length})
        </h3>
        <div className="grid grid-cols-5 md:grid-cols-11 gap-1">
          {aShareJobs.map(renderJob)}
        </div>
      </div>
      
      {/* US Jobs */}
      {usJobs.length > 0 && (
        <div>
          <h3 className="text-sm text-gray-400 mb-2">
            🇺🇸 美股 ({completedUS}/{usJobs.length})
          </h3>
          <div className="grid grid-cols-5 md:grid-cols-14 gap-1">
            {usJobs.map(renderJob)}
          </div>
        </div>
      )}
    </div>
  )
}
