import type { TodoItem } from '../data/parser'

interface Props {
  items: TodoItem[]
  onToggle: (id: string) => void
}

export default function TodoList({ items, onToggle }: Props) {
  const sortedItems = [...items].sort((a, b) => {
    // Done items go to bottom
    if (a.done !== b.done) return a.done ? 1 : -1
    // Then by time
    if (a.time && b.time) return a.time.localeCompare(b.time)
    // Then by priority
    const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2 }
    const aPri = a.priority ? priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3 : 3
    const bPri = b.priority ? priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3 : 3
    return aPri - bPri
  })

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="space-y-2">
        {sortedItems.map(item => (
          <div 
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
              ${item.done ? 'bg-gray-700/50 text-gray-500' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
              ${item.done ? 'border-green-500 bg-green-500/20' : 'border-gray-500'}`}
            >
              {item.done && <span className="text-green-400 text-xs">✓</span>}
            </div>
            
            <div className="flex-1">
              <span className={item.done ? 'line-through' : ''}>{item.text}</span>
            </div>

            {item.time && (
              <span className="text-xs text-gray-400 font-mono">{item.time}</span>
            )}
            
            {item.priority && (
              <span className={`text-xs px-2 py-0.5 rounded font-medium
                ${item.priority === 'P0' ? 'bg-red-900 text-red-300' : 
                  item.priority === 'P1' ? 'bg-yellow-900 text-yellow-300' : 
                  'bg-gray-600 text-gray-300'}`}
              >
                {item.priority}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
