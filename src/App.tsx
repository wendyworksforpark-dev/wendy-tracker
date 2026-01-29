import { useState, useEffect } from 'react'
import KanbanBoard from './components/KanbanBoard'
import TodoList from './components/TodoList'
import { parseIdeasMd } from './data/parser'
import type { KanbanItem, TodoItem } from './data/parser'

// Sample data - will be replaced with API/file fetch
const SAMPLE_IDEAS = `
## 🌊 Brainstorm (随便聊聊)
- [2026-01-29] Twitter情绪分析系统 - 用Gemini分析X情绪找股票信号

## 💡 Idea (值得探索)

## 📋 Product (准备执行)
- [2026-01-29] Wendy Work Tracker - 监控工作计划和待办

## ✅ Done (已完成)
- [2026-01-29] 设置半小时市场推送
- [2026-01-29] GitHub repo 管理 (clawd + ashare)
`

const SAMPLE_TODOS: TodoItem[] = [
  { id: '1', text: '开盘简报 (9:35)', done: true, time: '09:35' },
  { id: '2', text: '半小时简报 (10:00)', done: true, time: '10:00' },
  { id: '3', text: '半小时简报 (10:30)', done: true, time: '10:30' },
  { id: '4', text: '半小时简报 (11:00)', done: false, time: '11:00' },
  { id: '5', text: '午间收盘 (11:30)', done: false, time: '11:30' },
  { id: '6', text: '完成 Wendy Tracker MVP', done: false, priority: 'P0' },
]

function App() {
  const [kanbanItems, setKanbanItems] = useState<KanbanItem[]>([])
  const [todos, setTodos] = useState<TodoItem[]>(SAMPLE_TODOS)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const items = parseIdeasMd(SAMPLE_IDEAS)
    setKanbanItems(items)
  }, [])

  const refresh = () => {
    setLastUpdate(new Date())
    // In production: fetch from API or GitHub raw file
  }

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🐯 Wendy Work Tracker
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            更新: {lastUpdate.toLocaleTimeString('zh-CN')}
          </span>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            刷新
          </button>
        </div>
      </header>

      <main className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">📋 想法管道</h2>
          <KanbanBoard items={kanbanItems} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">📌 今日任务</h2>
          <TodoList items={todos} onToggle={(id) => {
            setTodos(todos.map(t => t.id === id ? {...t, done: !t.done} : t))
          }} />
        </section>
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        Wendy's Work Tracker • Data from IDEAS.md
      </footer>
    </div>
  )
}

export default App
