import { CircleDot, CheckCircle2, ExternalLink } from 'lucide-react'
import type { RepoIssues } from '../lib/github'

interface Props {
  repoIssues: RepoIssues[]
  loading?: boolean
}

export default function IssuesList({ repoIssues, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-5 bg-slate-100 rounded w-1/3" />
              {[1, 2, 3].map(j => (
                <div key={j} className="h-8 bg-slate-100 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (repoIssues.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-4 py-8 text-center text-sm text-slate-400">
        暂无 Issues
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {repoIssues.map(repo => (
        <div key={repo.repo} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {/* Repo Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
              {repo.displayName}
              <span className="text-xs text-slate-400 font-normal bg-white px-1.5 py-0.5 rounded">
                {repo.issues.length}
              </span>
            </h3>
          </div>

          {/* Issues List */}
          <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
            {repo.issues.map(issue => (
              <a
                key={issue.id}
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors group"
              >
                {/* Status icon */}
                {issue.state === 'open' ? (
                  <CircleDot size={14} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <CheckCircle2 size={14} className="text-purple-500 flex-shrink-0" />
                )}
                {/* Number */}
                <span className="text-xs text-slate-400 flex-shrink-0 font-mono">
                  #{issue.number}
                </span>
                {/* Title */}
                <span className="flex-1 text-sm text-slate-700 truncate">{issue.title}</span>
                {/* Labels */}
                <div className="flex gap-1 flex-shrink-0">
                  {issue.labels.map(label => (
                    <span
                      key={label.name}
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `#${label.color}18`,
                        color: `#${label.color}`,
                        border: `1px solid #${label.color}30`,
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
                <ExternalLink size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </a>
            ))}
            {repo.issues.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-slate-400">暂无 Issues</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
