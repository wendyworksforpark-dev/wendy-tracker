import { Search, Filter, Archive } from 'lucide-react'
import type { KanbanItem } from '../data/parser'

interface Props {
  searchTerm: string
  onSearchChange: (term: string) => void
  stageFilter: KanbanItem['stage'] | 'all'
  onStageFilterChange: (stage: KanbanItem['stage'] | 'all') => void
  typeFilter: KanbanItem['type'] | 'all'
  onTypeFilterChange: (type: KanbanItem['type'] | 'all') => void
  showArchived: boolean
  onShowArchivedChange: (show: boolean) => void
}

export default function SearchFilter({
  searchTerm,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  typeFilter,
  onTypeFilterChange,
  showArchived,
  onShowArchivedChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜索..."
          className="w-full bg-white border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
        />
      </div>

      {/* Stage Filter */}
      <div className="relative">
        <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <select
          value={stageFilter}
          onChange={(e) => onStageFilterChange(e.target.value as KanbanItem['stage'] | 'all')}
          className="appearance-none bg-white border border-slate-200 rounded-md pl-8 pr-8 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors cursor-pointer"
        >
          <option value="all">All Stages</option>
          <option value="backlog">Backlog</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Type Filter */}
      <select
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value as KanbanItem['type'] | 'all')}
        className="appearance-none bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors cursor-pointer"
      >
        <option value="all">All Types</option>
        <option value="idea">Idea</option>
        <option value="research">Research</option>
        <option value="build">Build</option>
      </select>

      {/* Archive Toggle */}
      <label className="inline-flex items-center gap-1.5 text-sm text-slate-500 cursor-pointer hover:text-slate-700 transition-colors select-none">
        <Archive size={14} />
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => onShowArchivedChange(e.target.checked)}
          className="sr-only"
        />
        <span className={showArchived ? 'text-indigo-600 font-medium' : ''}>
          Archived
        </span>
      </label>
    </div>
  )
}
