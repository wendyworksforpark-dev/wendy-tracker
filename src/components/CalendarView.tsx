import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Lightbulb, Search, Wrench } from 'lucide-react'
import type { KanbanItem } from '../data/parser'

interface Props {
  items: KanbanItem[]
}

const TYPE_ICONS: Record<KanbanItem['type'], { icon: typeof Lightbulb; color: string }> = {
  idea: { icon: Lightbulb, color: 'text-amber-500' },
  research: { icon: Search, color: 'text-purple-500' },
  build: { icon: Wrench, color: 'text-indigo-500' },
}

export default function CalendarView({ items }: Props) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const itemsByDate: Record<string, KanbanItem[]> = {}
    items.forEach(item => {
      if (item.date) {
        const dateKey = item.date
        if (!itemsByDate[dateKey]) {
          itemsByDate[dateKey] = []
        }
        itemsByDate[dateKey].push(item)
      }
    })

    const weeks: (number | null)[][] = []
    let week: (number | null)[] = []

    for (let i = 0; i < startDayOfWeek; i++) {
      week.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day)
      if (week.length === 7) {
        weeks.push(week)
        week = []
      }
    }

    while (week.length > 0 && week.length < 7) {
      week.push(null)
    }
    if (week.length > 0) {
      weeks.push(week)
    }

    return { weeks, itemsByDate, daysInMonth }
  }, [items, currentMonth, currentYear])

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                      '七月', '八月', '九月', '十月', '十一月', '十二月']
  const dayNames = ['日', '一', '二', '三', '四', '五', '六']

  const getDateKey = (day: number) => {
    const month = (currentMonth + 1).toString().padStart(2, '0')
    const dayStr = day.toString().padStart(2, '0')
    return `${currentYear}-${month}-${dayStr}`
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Month header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-sm font-semibold text-slate-700">
          {currentYear}年 {monthNames[currentMonth]}
        </h3>
        <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="p-4">
        {/* Day names header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.weeks.flat().map((day, idx) => {
            if (day === null) {
              return <div key={idx} className="h-20 rounded-md" />
            }

            const dateKey = getDateKey(day)
            const dayItems = calendarData.itemsByDate[dateKey] || []
            const isToday = day === today.getDate()

            return (
              <div
                key={idx}
                className={`h-20 rounded-md p-1.5 transition-colors ${
                  isToday
                    ? 'bg-indigo-50 ring-1 ring-indigo-200'
                    : dayItems.length > 0
                    ? 'bg-slate-50 hover:bg-slate-100'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className={`text-xs mb-1 ${
                  isToday ? 'text-indigo-600 font-semibold' : 'text-slate-500'
                }`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayItems.slice(0, 2).map((item, i) => {
                    const typeInfo = TYPE_ICONS[item.type]
                    const Icon = typeInfo.icon
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-0.5 text-xs truncate px-1 py-0.5 rounded ${
                          item.stage === 'done'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.stage === 'in_progress'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        <Icon size={9} className={typeInfo.color} />
                        <span className="truncate">{item.title}</span>
                      </div>
                    )
                  })}
                  {dayItems.length > 2 && (
                    <div className="text-xs text-slate-400 pl-1">+{dayItems.length - 2}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
