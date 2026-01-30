import { useMemo } from 'react'
import type { KanbanItem } from '../data/parser'

interface Props {
  items: KanbanItem[]
}

export default function CalendarView({ items }: Props) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const calendarData = useMemo(() => {
    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    // Group items by date
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

    // Build calendar grid
    const weeks: (number | null)[][] = []
    let week: (number | null)[] = []
    
    // Fill in blanks before first day
    for (let i = 0; i < startDayOfWeek; i++) {
      week.push(null)
    }

    // Fill in days
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day)
      if (week.length === 7) {
        weeks.push(week)
        week = []
      }
    }

    // Fill in remaining blanks
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
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-center">
        📅 {currentYear}年 {monthNames[currentMonth]}
      </h3>
      
      {/* Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.weeks.flat().map((day, idx) => {
          if (day === null) {
            return <div key={idx} className="h-16 bg-gray-900/50 rounded" />
          }

          const dateKey = getDateKey(day)
          const dayItems = calendarData.itemsByDate[dateKey] || []
          const isToday = day === today.getDate()

          return (
            <div
              key={idx}
              className={`h-16 rounded p-1 overflow-hidden ${
                isToday ? 'bg-blue-900/50 ring-1 ring-blue-500' : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
            >
              <div className={`text-xs ${isToday ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                {day}
              </div>
              <div className="space-y-0.5 mt-0.5">
                {dayItems.slice(0, 2).map((item, i) => (
                  <div
                    key={i}
                    className={`text-xs truncate px-1 rounded ${
                      item.stage === 'done' ? 'bg-green-900/50 text-green-300' :
                      item.stage === 'in_progress' ? 'bg-blue-900/50 text-blue-300' :
                      'bg-gray-700/50 text-gray-300'
                    }`}
                  >
                    {item.type === 'idea' ? '💡' : item.type === 'research' ? '🔍' : '🛠️'} {item.title}
                  </div>
                ))}
                {dayItems.length > 2 && (
                  <div className="text-xs text-gray-400">+{dayItems.length - 2}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
