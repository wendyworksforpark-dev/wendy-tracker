import { useState } from 'react'
import type { KanbanItem } from '../data/parser'

interface Props {
  isOpen: boolean
  onClose: () => void
  onAdd: (item: Omit<KanbanItem, 'date'>) => void
}

export default function AddCardModal({ isOpen, onClose, onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stage, setStage] = useState<KanbanItem['stage']>('brainstorm')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    
    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      stage,
    })
    
    setTitle('')
    setDescription('')
    setStage('brainstorm')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">➕ 添加新想法</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入想法标题..."
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">描述 (可选)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              placeholder="详细描述..."
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">阶段</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as KanbanItem['stage'])}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="brainstorm">🌊 Brainstorm</option>
              <option value="idea">💡 Idea</option>
              <option value="product">📋 Product</option>
              <option value="done">✅ Done</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
