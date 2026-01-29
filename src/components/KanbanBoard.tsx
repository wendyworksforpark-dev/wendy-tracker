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
  { key: 'brainstorm' as const, title: '🌊 Brainstorm', color: 'bg-purple-900/50 border-purple-700' },
  { key: 'idea' as const, title: '💡 Idea', color: 'bg-yellow-900/50 border-yellow-700' },
  { key: 'product' as const, title: '📋 Product', color: 'bg-blue-900/50 border-blue-700' },
  { key: 'done' as const, title: '✅ Done', color: 'bg-green-900/50 border-green-700' },
]

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-gray-800 rounded-lg p-3 text-sm hover:bg-gray-700 transition cursor-grab active:cursor-grabbing shadow-lg overflow-hidden"
    >
      <div className="font-medium truncate">{item.title}</div>
      {item.description && (
        <div className="text-gray-400 text-xs mt-1 truncate">{item.description}</div>
      )}
      {item.date && (
        <div className="text-gray-500 text-xs mt-2">{item.date}</div>
      )}
    </div>
  )
}

function DroppableColumn({ 
  column, 
  items,
  onCardClick 
}: { 
  column: typeof COLUMNS[0]
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
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const [stage, indexStr] = (active.id as string).split('-')
    const index = parseInt(indexStr)
    const stageItems = items.filter(i => i.stage === stage)
    setActiveItem(stageItems[index])
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)
    
    if (!over || !onMove) return
    
    const [activeStage, activeIndexStr] = (active.id as string).split('-')
    const activeIndex = parseInt(activeIndexStr)
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(col => (
          <DroppableColumn key={col.key} column={col} items={items} onCardClick={onCardClick} />
        ))}
      </div>
      
      <DragOverlay>
        {activeItem && (
          <div className="bg-gray-800 rounded-lg p-3 text-sm shadow-2xl border border-blue-500">
            <div className="font-medium">{activeItem.title}</div>
            {activeItem.description && (
              <div className="text-gray-400 text-xs mt-1">{activeItem.description}</div>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
