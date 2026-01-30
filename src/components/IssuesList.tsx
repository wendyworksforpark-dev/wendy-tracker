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
          <div key={i} className="bg-gray-800 rounded-lg p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-gray-700 rounded w-1/2"></div>
              {[1, 2, 3].map(j => (
                <div key={j} className="h-10 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (repoIssues.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-gray-500 text-sm">
        暂无 Issues
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {repoIssues.map(repo => (
        <div key={repo.repo} className="bg-gray-800 rounded-lg p-4">
          {/* Repo Header */}
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            {repo.displayName}
            <span className="text-sm text-gray-400 font-normal">
              ({repo.issues.length})
            </span>
          </h3>

          {/* Issues List */}
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {repo.issues.map(issue => (
              <a
                key={issue.id}
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                {/* Status icon */}
                <span className="flex-shrink-0">
                  {issue.state === 'open' ? '🟢' : '✅'}
                </span>
                {/* Number */}
                <span className="text-gray-400 flex-shrink-0">
                  #{issue.number}
                </span>
                {/* Title */}
                <span className="flex-1 truncate">{issue.title}</span>
                {/* Labels */}
                <div className="flex gap-1 flex-shrink-0">
                  {issue.labels.map(label => (
                    <span
                      key={label.name}
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `#${label.color}30`,
                        color: `#${label.color}`,
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </a>
            ))}
            {repo.issues.length === 0 && (
              <div className="text-gray-500 text-sm py-2">暂无 Issues</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
