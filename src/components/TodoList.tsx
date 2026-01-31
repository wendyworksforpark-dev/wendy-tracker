import { Check } from 'lucide-react'
import type { TodoItem } from '../data/parser'

interface Props {
  items: TodoItem[]
  onToggle: (id: string) => void
}

export default function TodoList({ items, onToggle }: Props) {
  const sortedItems = [...items].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (a.time && b.time) return a.time.localeCompare(b.time)
    const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2 }
    const aPri = a.priority ? priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3 : 3
    const bPri = b.priority ? priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3 : 3
    return aPri - bPri
  })

  if (sortedItems.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-400">
        暂无任务
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {sortedItems.map(item => (
        <div
          key={item.id}
          onClick={() => onToggle(item.id)}
          className={`flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer transition-colors group ${
            item.done ? 'opacity-50' : 'hover:bg-slate-50'
          }`}
        >
          {/* Checkbox */}
          <div
            className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              item.done
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-slate-300 group-hover:border-slate-400'
            }`}
          >
            {item.done && <Check size={10} className="text-white" strokeWidth={3} />}
          </div>

          {/* Text */}
          <span
            className={`flex-1 text-sm leading-snug ${
              item.done ? 'line-through text-slate-400' : 'text-slate-700'
            }`}
          >
            {item.text}
          </span>

          {/* Meta */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {item.time && (
              <span className="text-xs text-slate-400 font-mono">{item.time}</span>
            )}
            {item.priority && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  item.priority === 'P0'
                    ? 'bg-rose-50 text-rose-600'
                    : item.priority === 'P1'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {item.priority}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
