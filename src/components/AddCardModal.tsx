import { useState } from 'react'
import { X, Lightbulb, Search, Wrench } from 'lucide-react'
import type { KanbanItem } from '../data/parser'

interface Props {
  isOpen: boolean
  onClose: () => void
  onAdd: (item: Omit<KanbanItem, 'date'>) => void
}

const TYPES: { value: KanbanItem['type']; label: string; icon: typeof Lightbulb; color: string; bg: string }[] = [
  { value: 'idea', label: 'Idea', icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { value: 'research', label: 'Research', icon: Search, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  { value: 'build', label: 'Build', icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
]

const STAGES: { value: KanbanItem['stage']; label: string; dot: string }[] = [
  { value: 'backlog', label: 'Backlog', dot: 'bg-slate-400' },
  { value: 'in_progress', label: 'In Progress', dot: 'bg-blue-500' },
  { value: 'done', label: 'Done', dot: 'bg-emerald-500' },
]

export default function AddCardModal({ isOpen, onClose, onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<KanbanItem['type']>('idea')
  const [stage, setStage] = useState<KanbanItem['stage']>('backlog')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      stage,
    })

    setTitle('')
    setDescription('')
    setType('idea')
    setStage('backlog')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">新建想法</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              placeholder="输入标题..."
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              描述 <span className="text-slate-300 normal-case">可选</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 h-20 resize-none transition-colors"
              placeholder="详细描述..."
            />
          </div>

          {/* Type — visual selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">类型</label>
            <div className="flex gap-2">
              {TYPES.map(t => {
                const Icon = t.icon
                const isActive = type === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                      isActive ? `${t.bg} ${t.color}` : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={14} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">阶段</label>
            <div className="flex gap-2">
              {STAGES.map(s => {
                const isActive = stage === s.value
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStage(s.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                      isActive ? 'border-slate-300 bg-slate-100 text-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
