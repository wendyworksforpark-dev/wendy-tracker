import type { KanbanItem } from '../data/parser'

interface Props {
  searchTerm: string
  onSearchChange: (term: string) => void
  stageFilter: KanbanItem['stage'] | 'all'
  onStageFilterChange: (stage: KanbanItem['stage'] | 'all') => void
  showArchived: boolean
  onShowArchivedChange: (show: boolean) => void
}

export default function SearchFilter({
  searchTerm,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  showArchived,
  onShowArchivedChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="🔍 搜索想法..."
          className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stage Filter */}
      <select
        value={stageFilter}
        onChange={(e) => onStageFilterChange(e.target.value as KanbanItem['stage'] | 'all')}
        className="bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">全部阶段</option>
        <option value="brainstorm">🌊 Brainstorm</option>
        <option value="idea">💡 Idea</option>
        <option value="product">📋 Product</option>
        <option value="done">✅ Done</option>
      </select>

      {/* Show Archived Toggle */}
      <label className="flex items-center gap-2 bg-gray-700 rounded-lg px-4 py-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => onShowArchivedChange(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm">显示已归档</span>
      </label>
    </div>
  )
}
