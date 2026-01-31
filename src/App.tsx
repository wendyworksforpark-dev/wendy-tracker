import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  LayoutGrid,
  Calendar,
  BarChart3,
  Activity,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  Circle,
  Lightbulb,
  Search,
  Wrench,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
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
import { fetchRawFile, fetchRecentCommits, fetchCronStatus, fetchAllRepoIssues } from './lib/github'
import type { KanbanItem, TodoItem } from './data/parser'
import type { GitHubCommit, CronJob, RepoIssues } from './lib/github'

const SAMPLE_TODOS: TodoItem[] = []

type TabType = 'kanban' | 'calendar' | 'stats' | 'activity'

const NAV_ITEMS: { key: TabType; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'kanban', label: '看板', icon: LayoutGrid },
  { key: 'calendar', label: '日历', icon: Calendar },
  { key: 'stats', label: '统计', icon: BarChart3 },
  { key: 'activity', label: '活动', icon: Activity },
]

function App() {
  const [kanbanItems, setKanbanItems] = useState<KanbanItem[]>([])
  const [todos, setTodos] = useState<TodoItem[]>(SAMPLE_TODOS)
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [repoIssues, setRepoIssues] = useState<RepoIssues[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('kanban')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<KanbanItem | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState<KanbanItem['stage'] | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<KanbanItem['type'] | 'all'>('all')
  const [showArchived, setShowArchived] = useState(false)

  const handleMoveCard = (item: KanbanItem, newStage: KanbanItem['stage']) => {
    setKanbanItems(prev =>
      prev.map(i => (i.title === item.title ? { ...i, stage: newStage } : i))
    )
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

    // Fetch todos
    try {
      const todosResp = await fetch('./data/todos.json')
      if (todosResp.ok) {
        const todosData = await todosResp.json()
        const mapped: TodoItem[] = todosData.map((t: any) => ({
          id: t.id,
          text: t.title,
          done: t.status === 'completed',
          time: t.completed_at
            ? new Date(t.completed_at).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : undefined,
          priority: t.github_issue ? `#${t.github_issue}` : undefined,
          type: t.type || 'build',
          status: t.status || 'pending',
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
    } catch (e) {
      console.error('Failed to load ideas:', e)
    }

    // Commits
    try {
      setCommits(await fetchRecentCommits(10))
    } catch (e) {
      console.error('Failed to load commits:', e)
    }

    // Issues — all repos, open + closed
    try {
      setRepoIssues(await fetchAllRepoIssues())
    } catch (e) {
      console.error('Failed to load issues:', e)
    }

    // Cron
    try {
      setCronJobs(await fetchCronStatus())
    } catch (e) {
      console.error('Failed to load cron:', e)
    }

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
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        if (
          !item.title.toLowerCase().includes(term) &&
          !item.description?.toLowerCase().includes(term)
        ) {
          return false
        }
      }
      if (stageFilter !== 'all' && item.stage !== stageFilter) {
        return false
      }
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false
      }
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
  }, [kanbanItems, searchTerm, stageFilter, typeFilter, showArchived])

  const todoStats = useMemo(() => ({
    completed: todos.filter(t => t.done).length,
    pending: todos.filter(t => !t.done).length,
    ideas: todos.filter(t => t.type === 'idea').length,
    research: todos.filter(t => t.type === 'research').length,
    build: todos.filter(t => t.type === 'build').length,
  }), [todos])

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-slate-50 border-r border-slate-200 flex flex-col z-30 transition-all duration-200 ${
          sidebarCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Logo + Collapse Toggle */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl flex-shrink-0">🐯</span>
            {!sidebarCollapsed && (
              <span className="font-semibold text-slate-800 text-sm tracking-tight truncate">
                Wendy Tracker
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex-shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            title={sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.key
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Sidebar footer — spacer */}
        <div className="p-2 border-t border-slate-200" />
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-slate-200 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-slate-800">
              {NAV_ITEMS.find(n => n.key === activeTab)?.label}
            </h1>
            {activeTab === 'kanban' && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredItems.length} items
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {lastUpdate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
              title="刷新数据"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            {activeTab === 'kanban' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <Plus size={15} />
                添加
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {/* Cron Jobs — always visible at top */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-slate-400" />
              <h2 className="text-sm font-medium text-slate-600">定时任务</h2>
              <span className="text-xs text-slate-400">
                {cronJobs.filter(j => j.lastStatus === 'ok').length}/{cronJobs.length}
              </span>
            </div>
            <CronJobs jobs={cronJobs} />
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="xl:col-span-3 space-y-6">
              {activeTab === 'kanban' && (
                <section>
                  <SearchFilter
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    stageFilter={stageFilter}
                    onStageFilterChange={setStageFilter}
                    typeFilter={typeFilter}
                    onTypeFilterChange={setTypeFilter}
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
                <CalendarView items={kanbanItems} />
              )}

              {activeTab === 'stats' && (
                <BurndownChart items={kanbanItems} />
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <section>
                    <h2 className="text-sm font-medium text-slate-600 mb-3">最近提交</h2>
                    <CommitLog commits={commits} loading={loading} />
                  </section>
                  <section>
                    <h2 className="text-sm font-medium text-slate-600 mb-3">GitHub Issues</h2>
                    <IssuesList repoIssues={repoIssues} loading={loading} />
                  </section>
                </div>
              )}
            </div>

            {/* Right Sidebar — Today's Tasks + Stats */}
            <div className="space-y-4">
              {/* Today's Tasks */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-medium text-slate-700">今日任务</h3>
                </div>
                <div className="p-3">
                  <TodoList
                    items={todos}
                    onToggle={id => {
                      setTodos(todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)))
                    }}
                  />
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-medium text-slate-700">今日统计</h3>
                </div>
                <div className="p-4 space-y-4">
                  {/* Completion */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-lg font-semibold text-emerald-700">{todoStats.completed}</span>
                      </div>
                      <span className="text-xs text-emerald-600">已完成</span>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Circle size={14} className="text-amber-500" />
                        <span className="text-lg font-semibold text-amber-700">{todoStats.pending}</span>
                      </div>
                      <span className="text-xs text-amber-600">待完成</span>
                    </div>
                  </div>

                  {/* Type breakdown */}
                  <div>
                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">类型</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm text-slate-600">
                          <Lightbulb size={14} className="text-amber-500" /> Ideas
                        </span>
                        <span className="text-sm font-medium text-slate-700">{todoStats.ideas}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm text-slate-600">
                          <Search size={14} className="text-purple-500" /> Research
                        </span>
                        <span className="text-sm font-medium text-slate-700">{todoStats.research}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm text-slate-600">
                          <Wrench size={14} className="text-indigo-500" /> Build
                        </span>
                        <span className="text-sm font-medium text-slate-700">{todoStats.build}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 text-center text-xs text-slate-400">
          Wendy's Work Tracker ·{' '}
          <a
            href="https://github.com/wendyworksforpark-dev/wendy-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-indigo-500 transition-colors"
          >
            GitHub
          </a>
        </footer>
      </div>

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
        onMove={stage => selectedCard && handleMoveCard(selectedCard, stage)}
        onDelete={() => selectedCard && handleDeleteCard(selectedCard)}
      />
    </div>
  )
}

export default App
