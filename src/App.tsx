import { useState, useEffect, useCallback, useMemo } from 'react'
import KanbanBoard from './components/KanbanBoard'
import TodoList from './components/TodoList'
import CronJobs from './components/CronJobs'
import CommitLog from './components/CommitLog'
import IssuesList from './components/IssuesList'
import AddCardModal from './components/AddCardModal'
import CardDetail from './components/CardDetail'
import SearchFilter from './components/SearchFilter'
import CalendarView from './components/CalendarView'
import BurndownChart from './components/BurndownChart'
import { parseIdeasMd } from './data/parser'
import { fetchRawFile, fetchRecentCommits, fetchIssues, fetchCronStatus } from './lib/github'
import type { KanbanItem, TodoItem } from './data/parser'
import type { GitHubCommit, CronJob } from './lib/github'

const SAMPLE_TODOS: TodoItem[] = []

type TabType = 'kanban' | 'calendar' | 'stats' | 'activity'

function App() {
  const [kanbanItems, setKanbanItems] = useState<KanbanItem[]>([])
  const [todos, setTodos] = useState<TodoItem[]>(SAMPLE_TODOS)
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [issues, setIssues] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('kanban')
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<KanbanItem | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState<KanbanItem['stage'] | 'all'>('all')
  const [showArchived, setShowArchived] = useState(false)

  const handleMoveCard = (item: KanbanItem, newStage: KanbanItem['stage']) => {
    setKanbanItems(prev => prev.map(i => 
      i.title === item.title ? { ...i, stage: newStage } : i
    ))
    setSelectedCard(null)
  }

  const handleAddCard = (newItem: Omit<KanbanItem, 'date'>) => {
    const today = new Date().toISOString().split('T')[0]
    setKanbanItems(prev => [...prev, { ...newItem, date: today }])
  }

  const handleDeleteCard = (item: KanbanItem) => {
    setKanbanItems(prev => prev.filter(i => i.title !== item.title))
    setSelectedCard(null)
  }

  const handleCardClick = (item: KanbanItem) => {
    setSelectedCard(item)
  }

  const loadData = useCallback(async () => {
    setLoading(true)

    // Fetch todos first — independent, never fails silently
    try {
      const todosResp = await fetch('./data/todos.json')
      if (todosResp.ok) {
        const todosData = await todosResp.json()
        const mapped: TodoItem[] = todosData.map((t: any) => ({
          id: t.id,
          text: t.title,
          done: t.status === 'completed',
          time: t.completed_at ? new Date(t.completed_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : undefined,
          priority: t.github_issue ? `#${t.github_issue}` : undefined,
        }))
        setTodos(mapped)
      }
    } catch (e) {
      console.error('Failed to load todos:', e)
    }

    // Kanban / IDEAS.md
    try {
      const ideasContent = await fetchRawFile('IDEAS.md')
      setKanbanItems(parseIdeasMd(ideasContent))
    } catch (e) { console.error('Failed to load ideas:', e) }

    // Commits
    try {
      setCommits(await fetchRecentCommits(10))
    } catch (e) { console.error('Failed to load commits:', e) }

    // Issues
    try {
      setIssues(await fetchIssues('wendy-tracker'))
    } catch (e) { console.error('Failed to load issues:', e) }

    // Cron
    try {
      setCronJobs(await fetchCronStatus())
    } catch (e) { console.error('Failed to load cron:', e) }

    setLastUpdate(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadData])

  // Filtered items
  const filteredItems = useMemo(() => {
    return kanbanItems.filter(item => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        if (!item.title.toLowerCase().includes(term) && 
            !item.description?.toLowerCase().includes(term)) {
          return false
        }
      }
      // Stage filter
      if (stageFilter !== 'all' && item.stage !== stageFilter) {
        return false
      }
      // Archive filter (done items older than 7 days)
      if (!showArchived && item.stage === 'done' && item.date) {
        const itemDate = new Date(item.date)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        if (itemDate < weekAgo) {
          return false
        }
      }
      return true
    })
  }, [kanbanItems, searchTerm, stageFilter, showArchived])

  const tabs = [
    { key: 'kanban' as const, label: '📋 看板' },
    { key: 'calendar' as const, label: '📅 日历' },
    { key: 'stats' as const, label: '📊 统计' },
    { key: 'activity' as const, label: '⚡ 活动' },
  ]

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          🐯 Wendy Work Tracker
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            {lastUpdate.toLocaleTimeString('zh-CN')}
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

      {/* Cron Jobs */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          ⏰ 定时任务
          <span className="text-sm text-gray-400 font-normal">
            ({cronJobs.filter(j => j.lastStatus === 'ok').length}/{cronJobs.length})
          </span>
        </h2>
        <CronJobs jobs={cronJobs} />
      </section>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === tab.key ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'kanban' && (
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
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                stageFilter={stageFilter}
                onStageFilterChange={setStageFilter}
                showArchived={showArchived}
                onShowArchivedChange={setShowArchived}
              />
              <KanbanBoard 
                items={filteredItems} 
                onMove={handleMoveCard}
                onCardClick={handleCardClick}
              />
            </section>
          )}

          {activeTab === 'calendar' && (
            <section>
              <h2 className="text-lg font-semibold mb-3">📅 日历视图</h2>
              <CalendarView items={kanbanItems} />
            </section>
          )}

          {activeTab === 'stats' && (
            <section>
              <h2 className="text-lg font-semibold mb-3">📊 统计分析</h2>
              <BurndownChart items={kanbanItems} />
            </section>
          )}

          {activeTab === 'activity' && (
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

      {/* Modals */}
      <AddCardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCard}
      />

      <CardDetail
        item={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onMove={(stage) => selectedCard && handleMoveCard(selectedCard, stage)}
        onDelete={() => selectedCard && handleDeleteCard(selectedCard)}
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
