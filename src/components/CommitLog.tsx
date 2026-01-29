import type { GitHubCommit } from '../lib/github'

interface Props {
  commits: GitHubCommit[]
  loading?: boolean
}

export default function CommitLog({ commits, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
      <div className="space-y-2">
        {commits.map(commit => (
          <a
            key={commit.sha}
            href={commit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition"
          >
            <code className="text-xs text-blue-400 font-mono">{commit.sha}</code>
            <span className="flex-1 text-sm truncate">{commit.message}</span>
            <span className="text-xs text-gray-500">{commit.date}</span>
          </a>
        ))}
        {commits.length === 0 && (
          <div className="text-gray-500 text-sm">暂无提交记录</div>
        )}
      </div>
    </div>
  )
}
