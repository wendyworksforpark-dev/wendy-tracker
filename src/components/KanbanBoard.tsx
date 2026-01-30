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
import type { KanbanItem } from '../data/parser'

interface Props {
  items: KanbanItem[]
  onMove?: (item: KanbanItem, newStage: KanbanItem['stage']) => void
  onCardClick?: (item: KanbanItem) => void
}

const COLUMNS = [
  { key: 'backlog' as const, title: '⬜ Backlog', color: 'bg-gray-900/50 border-gray-600' },
  { key: 'in_progress' as const, title: '🔵 In Progress', color: 'bg-blue-900/50 border-blue-700' },
  { key: 'done' as const, title: '✅ Done', color: 'bg-green-900/50 border-green-700' },
]

const TYPE_BADGE: Record<KanbanItem['type'], { icon: string; color: string }> = {
  idea: { icon: '💡', color: 'bg-yellow-900/50 text-yellow-300' },
  research: { icon: '🔍', color: 'bg-purple-900/50 text-purple-300' },
  build: { icon: '🛠️', color: 'bg-blue-900/50 text-blue-300' },
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
    opacity: isDragging ? 0.5 : 1,
  }

  const badge = TYPE_BADGE[item.type]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-gray-800 rounded-lg p-3 text-sm hover:bg-gray-700 transition cursor-grab active:cursor-grabbing shadow-lg overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs px-1.5 py-0.5 rounded ${badge.color}`}>
          {badge.icon} {item.type}
        </span>
        {item.repo && (
          <span className="text-xs text-gray-500">{item.repo}</span>
        )}
      </div>
      <div className="font-medium truncate">{item.title}</div>
      {item.description && (
        <div className="text-gray-400 text-xs mt-1 truncate">{item.description}</div>
      )}
      <div className="flex items-center gap-2 mt-2">
        {item.date && (
          <span className="text-gray-500 text-xs">{item.date}</span>
        )}
        {item.github_issue && (
          <span className="text-gray-500 text-xs">#{item.github_issue}</span>
        )}
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
    <div className={`rounded-lg border p-4 min-h-[200px] ${column.color}`}>
      <h3 className="font-semibold mb-3 text-sm flex justify-between">
        {column.title}
        <span className="text-gray-400">{colItems.length}</span>
      </h3>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {colItems.map((item, idx) => (
            <KanbanCard
              key={`${column.key}-${idx}`}
              item={item}
              index={idx}
              onClick={() => onCardClick?.(item)}
            />
          ))}
          {colItems.length === 0 && (
            <div className="text-gray-500 text-sm italic p-4 text-center border-2 border-dashed border-gray-600 rounded-lg">
              拖拽到这里
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

    // Determine target column
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

  const badge = activeItem ? TYPE_BADGE[activeItem.type] : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => (
          <DroppableColumn key={col.key} column={col} items={items} onCardClick={onCardClick} />
        ))}
      </div>

      <DragOverlay>
        {activeItem && badge && (
          <div className="bg-gray-800 rounded-lg p-3 text-sm shadow-2xl border border-blue-500">
            <span className={`text-xs px-1.5 py-0.5 rounded ${badge.color}`}>
              {badge.icon} {activeItem.type}
            </span>
            <div className="font-medium mt-1">{activeItem.title}</div>
            {activeItem.description && (
              <div className="text-gray-400 text-xs mt-1">{activeItem.description}</div>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
