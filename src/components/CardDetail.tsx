import type { KanbanItem } from '../data/parser'

interface Props {
  item: KanbanItem | null
  isOpen: boolean
  onClose: () => void
  onMove: (stage: KanbanItem['stage']) => void
  onDelete: () => void
}

const STAGES = [
  { key: 'backlog' as const, label: '⬜ Backlog', color: 'bg-gray-600' },
  { key: 'in_progress' as const, label: '🔵 In Progress', color: 'bg-blue-600' },
  { key: 'done' as const, label: '✅ Done', color: 'bg-green-600' },
]

const TYPE_INFO: Record<KanbanItem['type'], { icon: string; label: string; color: string }> = {
  idea: { icon: '💡', label: 'Idea', color: 'bg-yellow-900/50 text-yellow-300' },
  research: { icon: '🔍', label: 'Research', color: 'bg-purple-900/50 text-purple-300' },
  build: { icon: '🛠️', label: 'Build', color: 'bg-blue-900/50 text-blue-300' },
}

export default function CardDetail({ item, isOpen, onClose, onMove, onDelete }: Props) {
  if (!isOpen || !item) return null

  const typeInfo = TYPE_INFO[item.type]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded ${typeInfo.color}`}>
                {typeInfo.icon} {typeInfo.label}
              </span>
            </div>
            <h2 className="text-xl font-bold">{item.title}</h2>
            {item.date && (
              <span className="text-sm text-gray-400">创建于 {item.date}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {item.description && (
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <p className="text-gray-300">{item.description}</p>
          </div>
        )}

        {item.github_issue && (
          <div className="text-sm text-gray-400 mb-4">
            GitHub Issue: #{item.github_issue}
            {item.repo && <span className="ml-1">({item.repo})</span>}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">当前阶段</label>
          <div className="flex flex-wrap gap-2">
            {STAGES.map(stage => (
              <button
                key={stage.key}
                onClick={() => onMove(stage.key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  item.stage === stage.key
                    ? `${stage.color} ring-2 ring-white`
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            关闭
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg transition"
          >
            🗑️ 删除
          </button>
        </div>
      </div>
    </div>
  )
}
