import { X, Trash2, Lightbulb, Search, Wrench, ExternalLink } from 'lucide-react'
import type { KanbanItem } from '../data/parser'

interface Props {
  item: KanbanItem | null
  isOpen: boolean
  onClose: () => void
  onMove: (stage: KanbanItem['stage']) => void
  onDelete: () => void
}

const STAGES = [
  { key: 'backlog' as const, label: 'Backlog', dot: 'bg-slate-400', active: 'bg-slate-100 text-slate-700 ring-1 ring-slate-300' },
  { key: 'in_progress' as const, label: 'In Progress', dot: 'bg-blue-500', active: 'bg-blue-50 text-blue-700 ring-1 ring-blue-300' },
  { key: 'done' as const, label: 'Done', dot: 'bg-emerald-500', active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300' },
]

const TYPE_INFO: Record<KanbanItem['type'], { icon: typeof Lightbulb; label: string; color: string; bg: string }> = {
  idea: { icon: Lightbulb, label: 'Idea', color: 'text-amber-600', bg: 'bg-amber-50' },
  research: { icon: Search, label: 'Research', color: 'text-purple-600', bg: 'bg-purple-50' },
  build: { icon: Wrench, label: 'Build', color: 'text-indigo-600', bg: 'bg-indigo-50' },
}

export default function CardDetail({ item, isOpen, onClose, onMove, onDelete }: Props) {
  if (!isOpen || !item) return null

  const typeInfo = TYPE_INFO[item.type]
  const Icon = typeInfo.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${typeInfo.bg} ${typeInfo.color} font-medium`}>
                <Icon size={12} />
                {typeInfo.label}
              </span>
              {item.date && (
                <span className="text-xs text-slate-400">{item.date}</span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-slate-800 leading-snug">{item.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-4 space-y-4">
          {item.description && (
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          )}

          {item.github_issue && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ExternalLink size={14} />
              <span>
                Issue #{item.github_issue}
                {item.repo && <span className="text-slate-400 ml-1">· {item.repo}</span>}
              </span>
            </div>
          )}

          {/* Stage selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Stage
            </label>
            <div className="flex gap-2">
              {STAGES.map(stage => (
                <button
                  key={stage.key}
                  onClick={() => onMove(stage.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    item.stage === stage.key
                      ? stage.active
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                  {stage.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <Trash2 size={14} />
            删除
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-md transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
