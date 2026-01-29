import { useState, useEffect, useCallback } from 'react'
import KanbanBoard from './components/KanbanBoard'
import TodoList from './components/TodoList'
import CronJobs from './components/CronJobs'
import CommitLog from './components/CommitLog'
import IssuesList from './components/IssuesList'
import AddCardModal from './components/AddCardModal'
import { parseIdeasMd } from './data/parser'
import { fetchRawFile, fetchRecentCommits, fetchIssues, getMockCronJobs } from './lib/github'
import type { KanbanItem, TodoItem } from './data/parser'
import type { GitHubCommit, CronJob } from './lib/github'

const SAMPLE_TODOS: TodoItem[] = [
  { id: '1', text: '开盘简报', done: true, time: '09:35' },
  { id: '2', text: '半小时简报', done: true, time: '10:00' },
  { id: '3', text: '半小时简报', done: true, time: '10:30' },
  { id: '4', text: '半小时简报', done: false, time: '11:00' },
  { id: '5', text: '午间收盘', done: false, time: '11:30' },
  { id: '6', text: '完成 Wendy Tracker 全功能', done: false, priority: 'P0' },
]

function App() {
  const [kanbanItems, setKanbanItems] = useState<KanbanItem[]>([])
  const [todos, setTodos] = useState<TodoItem[]>(SAMPLE_TODOS)
  const [cronJobs] = useState<CronJob[]>(getMockCronJobs())
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [issues, setIssues] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'kanban' | 'timeline'>('kanban')
  const [showAddModal, setShowAddModal] = useState(false)

  const handleMoveCard = (item: KanbanItem, newStage: KanbanItem['stage']) => {
    setKanbanItems(prev => prev.map(i => 
      i.title === item.title ? { ...i, stage: newStage } : i
    ))
  }

  const handleAddCard = (newItem: Omit<KanbanItem, 'date'>) => {
    const today = new Date().toISOString().split('T')[0]
    setKanbanItems(prev => [...prev, { ...newItem, date: today }])
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch IDEAS.md from GitHub
      const ideasContent = await fetchRawFile('IDEAS.md')
      const items = parseIdeasMd(ideasContent)
      setKanbanItems(items)
      
      // Fetch commits
      const recentCommits = await fetchRecentCommits(10)
      setCommits(recentCommits)
      
      // Fetch issues
      const openIssues = await fetchIssues('wendy-tracker')
      setIssues(openIssues)
      
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    // Auto refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadData])

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          🐯 Wendy Work Tracker
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            更新: {lastUpdate.toLocaleTimeString('zh-CN')}
          </span>
          <button 
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition flex items-center gap-2"
          >
            {loading && <span className="animate-spin">⟳</span>}
            刷新
          </button>
        </div>
      </header>

      {/* Cron Jobs Status */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          ⏰ 定时任务
          <span className="text-sm text-gray-400 font-normal">
            (今日 {cronJobs.filter(j => j.lastStatus === 'ok').length}/{cronJobs.length})
          </span>
        </h2>
        <CronJobs jobs={cronJobs} />
      </section>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === 'kanban' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          📋 看板
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === 'timeline' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          📊 活动
        </button>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'kanban' ? (
            <section>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">📋 想法管道</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition"
                >
                  ➕ 添加
                </button>
              </div>
              <KanbanBoard items={kanbanItems} onMove={handleMoveCard} />
            </section>
          ) : (
            <>
              <section>
                <h2 className="text-lg font-semibold mb-3">📝 最近提交</h2>
                <CommitLog commits={commits} loading={loading} />
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-3">🎯 GitHub Issues</h2>
                <IssuesList issues={issues} loading={loading} />
              </section>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-3">📌 今日任务</h2>
            <TodoList 
              items={todos} 
              onToggle={(id) => {
                setTodos(todos.map(t => t.id === id ? {...t, done: !t.done} : t))
              }} 
            />
          </section>
          
          <section className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">📊 今日统计</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {todos.filter(t => t.done).length}
                </div>
                <div className="text-xs text-gray-400">已完成</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {todos.filter(t => !t.done).length}
                </div>
                <div className="text-xs text-gray-400">待完成</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {kanbanItems.filter(i => i.stage === 'product').length}
                </div>
                <div className="text-xs text-gray-400">进行中</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {kanbanItems.filter(i => i.stage === 'brainstorm').length}
                </div>
                <div className="text-xs text-gray-400">Brainstorm</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <AddCardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCard}
      />

      <footer className="mt-8 text-center text-gray-500 text-sm">
        Wendy's Work Tracker • 
        <a href="https://github.com/wendyworksforpark-dev/wendy-tracker" 
           target="_blank" 
           rel="noopener noreferrer"
           className="hover:text-gray-300 ml-1"
        >
          GitHub
        </a>
      </footer>
    </div>
  )
}

export default App
