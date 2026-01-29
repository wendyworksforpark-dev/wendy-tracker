import type { CronJob } from '../lib/github'

interface Props {
  jobs: CronJob[]
}

export default function CronJobs({ jobs }: Props) {
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {jobs.map(job => {
          const isPast = job.nextRun < currentTime
          const isCurrent = job.nextRun === currentTime
          
          return (
            <div 
              key={job.id}
              className={`p-3 rounded-lg text-center transition
                ${isCurrent ? 'bg-blue-600 animate-pulse' : 
                  isPast ? 'bg-gray-700 text-gray-500' : 
                  'bg-gray-700 hover:bg-gray-600'}`}
            >
              <div className="text-lg font-mono font-bold">
                {job.nextRun}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {job.name.replace('market-', '')}
              </div>
              {job.lastStatus && (
                <div className={`text-xs mt-1 ${job.lastStatus === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                  {isPast ? '✓' : ''}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
