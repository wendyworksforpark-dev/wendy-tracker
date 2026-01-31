import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Lightbulb, Search, Wrench, GripVertical } from 'lucide-react'
import type { KanbanItem } from '../data/parser'

interface Props {
  items: KanbanItem[]
  onMove?: (item: KanbanItem, newStage: KanbanItem['stage']) => void
  onCardClick?: (item: KanbanItem) => void
}

const COLUMNS = [
  { key: 'backlog' as const, title: 'Backlog', dotColor: 'bg-slate-400', headerBg: 'bg-slate-50', borderColor: 'border-slate-200' },
  { key: 'in_progress' as const, title: 'In Progress', dotColor: 'bg-blue-500', headerBg: 'bg-blue-50', borderColor: 'border-blue-200' },
  { key: 'done' as const, title: 'Done', dotColor: 'bg-emerald-500', headerBg: 'bg-emerald-50', borderColor: 'border-emerald-200' },
]

const TYPE_BADGE: Record<KanbanItem['type'], { icon: typeof Lightbulb; label: string; color: string; bg: string }> = {
  idea: { icon: Lightbulb, label: 'Idea', color: 'text-amber-600', bg: 'bg-amber-50' },
  research: { icon: Search, label: 'Research', color: 'text-purple-600', bg: 'bg-purple-50' },
  build: { icon: Wrench, label: 'Build', color: 'text-indigo-600', bg: 'bg-indigo-50' },
}

interface KanbanCardProps {
  item: KanbanItem
  index: number
  onClick?: () => void
}

function KanbanCard({ item, index, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${item.stage}-${index}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const badge = TYPE_BADGE[item.type]
  const Icon = badge.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group bg-white rounded-lg border border-slate-200 p-3 text-sm hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-start gap-2">
        <div
          {...listeners}
          className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500"
        >
          <GripVertical size={14} />
        </div>
        <div className="flex-1 min-w-0" onClick={onClick}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${badge.bg} ${badge.color} font-medium`}>
              <Icon size={11} />
              {badge.label}
            </span>
            {item.repo && (
              <span className="text-xs text-slate-400 font-mono">{item.repo}</span>
            )}
          </div>
          <div className="font-medium text-slate-800 truncate leading-snug">{item.title}</div>
          {item.description && (
            <div className="text-slate-500 text-xs mt-1 truncate leading-relaxed">{item.description}</div>
          )}
          <div className="flex items-center gap-2 mt-2">
            {item.date && (
              <span className="text-slate-400 text-xs">{item.date}</span>
            )}
            {item.github_issue && (
              <span className="text-slate-400 text-xs font-mono">#{item.github_issue}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DroppableColumn({
  column,
  items,
  onCardClick,
}: {
  column: (typeof COLUMNS)[0]
  items: KanbanItem[]
  onCardClick?: (item: KanbanItem) => void
}) {
  const colItems = items.filter(i => i.stage === column.key)
  const itemIds = colItems.map((_, idx) => `${column.key}-${idx}`)

  return (
    <div className="flex flex-col min-h-[250px] max-h-[calc(100vh-280px)]">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-lg mb-3 ${column.headerBg} shrink-0`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${column.dotColor}`} />
          <h3 className="text-sm font-medium text-slate-700">{column.title}</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium bg-white px-1.5 py-0.5 rounded">
          {colItems.length}
        </span>
      </div>

      {/* Cards — scrollable */}
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
          {colItems.map((item, idx) => (
            <KanbanCard
              key={`${column.key}-${idx}`}
              item={item}
              index={idx}
              onClick={() => onCardClick?.(item)}
            />
          ))}
          {colItems.length === 0 && (
            <div className="text-slate-400 text-sm p-6 text-center border-2 border-dashed border-slate-200 rounded-lg">
              No items
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default function KanbanBoard({ items, onMove, onCardClick }: Props) {
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const idStr = active.id as string
    const lastDash = idStr.lastIndexOf('-')
    const stage = idStr.slice(0, lastDash)
    const index = parseInt(idStr.slice(lastDash + 1))
    const stageItems = items.filter(i => i.stage === stage)
    setActiveItem(stageItems[index])
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over || !onMove) return

    const activeIdStr = active.id as string
    const lastDash = activeIdStr.lastIndexOf('-')
    const activeStage = activeIdStr.slice(0, lastDash)
    const activeIndex = parseInt(activeIdStr.slice(lastDash + 1))
    const overIdStr = over.id as string

    let targetStage: KanbanItem['stage'] | null = null
    for (const col of COLUMNS) {
      if (overIdStr.startsWith(col.key)) {
        targetStage = col.key
        break
      }
    }

    if (targetStage && targetStage !== activeStage) {
      const stageItems = items.filter(i => i.stage === activeStage)
      const movedItem = stageItems[activeIndex]
      if (movedItem) {
        onMove(movedItem, targetStage)
      }
    }
  }

  const activeBadge = activeItem ? TYPE_BADGE[activeItem.type] : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COLUMNS.map(col => (
          <DroppableColumn key={col.key} column={col} items={items} onCardClick={onCardClick} />
        ))}
      </div>

      <DragOverlay>
        {activeItem && activeBadge && (() => {
          const Icon = activeBadge.icon
          return (
            <div className="bg-white rounded-lg border-2 border-indigo-400 p-3 text-sm shadow-lg w-72">
              <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${activeBadge.bg} ${activeBadge.color} font-medium`}>
                <Icon size={11} />
                {activeBadge.label}
              </span>
              <div className="font-medium text-slate-800 mt-1.5">{activeItem.title}</div>
              {activeItem.description && (
                <div className="text-slate-500 text-xs mt-1">{activeItem.description}</div>
              )}
            </div>
          )
        })()}
      </DragOverlay>
    </DndContext>
  )
}
