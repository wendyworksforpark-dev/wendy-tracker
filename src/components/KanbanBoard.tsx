import type { KanbanItem } from '../data/parser'

interface Props {
  items: KanbanItem[]
}

const COLUMNS = [
  { key: 'brainstorm', title: '🌊 Brainstorm', color: 'bg-purple-900/50 border-purple-700' },
  { key: 'idea', title: '💡 Idea', color: 'bg-yellow-900/50 border-yellow-700' },
  { key: 'product', title: '📋 Product', color: 'bg-blue-900/50 border-blue-700' },
  { key: 'done', title: '✅ Done', color: 'bg-green-900/50 border-green-700' },
]

export default function KanbanBoard({ items }: Props) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {COLUMNS.map(col => {
        const colItems = items.filter(i => i.stage === col.key)
        return (
          <div 
            key={col.key} 
            className={`rounded-lg border p-4 min-h-[200px] ${col.color}`}
          >
            <h3 className="font-semibold mb-3 text-sm">{col.title}</h3>
            <div className="space-y-2">
              {colItems.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-gray-800 rounded p-3 text-sm hover:bg-gray-700 transition cursor-pointer"
                >
                  <div className="font-medium">{item.title}</div>
                  {item.description && (
                    <div className="text-gray-400 text-xs mt-1">{item.description}</div>
                  )}
                  {item.date && (
                    <div className="text-gray-500 text-xs mt-2">{item.date}</div>
                  )}
                </div>
              ))}
              {colItems.length === 0 && (
                <div className="text-gray-500 text-sm italic">空</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
