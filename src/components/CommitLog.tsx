import { GitCommit, ExternalLink } from 'lucide-react'
import type { GitHubCommit } from '../lib/github'

interface Props {
  commits: GitHubCommit[]
  loading?: boolean
}

export default function CommitLog({ commits, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-4 h-4 bg-slate-100 rounded-full" />
              <div className="flex-1 h-4 bg-slate-100 rounded" />
              <div className="w-16 h-4 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {commits.map(commit => (
          <a
            key={commit.sha}
            href={commit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
          >
            <GitCommit size={14} className="text-slate-400 flex-shrink-0" />
            <code className="text-xs text-indigo-600 font-mono flex-shrink-0 bg-indigo-50 px-1.5 py-0.5 rounded">
              {commit.sha}
            </code>
            <span className="flex-1 text-sm text-slate-700 truncate">{commit.message}</span>
            <span className="text-xs text-slate-400 flex-shrink-0">{commit.date}</span>
            <ExternalLink size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </a>
        ))}
        {commits.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            暂无提交记录
          </div>
        )}
      </div>
    </div>
  )
}
