interface Issue {
  id: number
  number: number
  title: string
  state: string
  html_url: string
  labels: { name: string; color: string }[]
  created_at: string
}

interface Props {
  issues: Issue[]
  loading?: boolean
}

export default function IssuesList({ issues, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="animate-pulse space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="space-y-2">
        {issues.map(issue => (
          <a
            key={issue.id}
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition"
          >
            <span className="text-green-400">●</span>
            <span className="text-gray-400 text-sm">#{issue.number}</span>
            <span className="flex-1 truncate">{issue.title}</span>
            <div className="flex gap-1">
              {issue.labels.map(label => (
                <span 
                  key={label.name}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ backgroundColor: `#${label.color}30`, color: `#${label.color}` }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          </a>
        ))}
        {issues.length === 0 && (
          <div className="text-gray-500 text-sm">暂无 Issues</div>
        )}
      </div>
    </div>
  )
}
