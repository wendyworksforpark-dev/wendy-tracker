import { useMemo } from 'react'
import type { KanbanItem } from '../data/parser'

interface Props {
  items: KanbanItem[]
}

export default function BurndownChart({ items }: Props) {
  const chartData = useMemo(() => {
    // Group items by date and count by stage
    const dateMap: Record<string, { total: number; done: number }> = {}
    
    items.forEach(item => {
      if (item.date) {
        if (!dateMap[item.date]) {
          dateMap[item.date] = { total: 0, done: 0 }
        }
        dateMap[item.date].total++
        if (item.stage === 'done') {
          dateMap[item.date].done++
        }
      }
    })

    // Sort dates and create cumulative data
    const sortedDates = Object.keys(dateMap).sort()
    let cumTotal = 0
    let cumDone = 0
    
    return sortedDates.map(date => {
      cumTotal += dateMap[date].total
      cumDone += dateMap[date].done
      return {
        date,
        total: cumTotal,
        done: cumDone,
        remaining: cumTotal - cumDone,
      }
    })
  }, [items])

  const stats = useMemo(() => {
    const total = items.length
    const done = items.filter(i => i.stage === 'done').length
    const inProgress = items.filter(i => i.stage === 'product').length
    const ideas = items.filter(i => i.stage === 'idea' || i.stage === 'brainstorm').length
    
    return { total, done, inProgress, ideas }
  }, [items])

  const maxValue = Math.max(...chartData.map(d => d.total), 1)

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">📈 进度燃尽图</h3>
      
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-700 rounded">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-gray-400">总计</div>
        </div>
        <div className="text-center p-2 bg-green-900/30 rounded">
          <div className="text-2xl font-bold text-green-400">{stats.done}</div>
          <div className="text-xs text-gray-400">完成</div>
        </div>
        <div className="text-center p-2 bg-blue-900/30 rounded">
          <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
          <div className="text-xs text-gray-400">进行中</div>
        </div>
        <div className="text-center p-2 bg-purple-900/30 rounded">
          <div className="text-2xl font-bold text-purple-400">{stats.ideas}</div>
          <div className="text-xs text-gray-400">想法</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>完成进度</span>
          <span>{stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%</span>
        </div>
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
            style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Simple Chart */}
      {chartData.length > 0 ? (
        <div className="h-32 flex items-end gap-1">
          {chartData.slice(-14).map((data, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col-reverse gap-0.5">
                <div 
                  className="w-full bg-green-600 rounded-t"
                  style={{ height: `${(data.done / maxValue) * 80}px` }}
                  title={`完成: ${data.done}`}
                />
                <div 
                  className="w-full bg-gray-600 rounded-t"
                  style={{ height: `${(data.remaining / maxValue) * 80}px` }}
                  title={`剩余: ${data.remaining}`}
                />
              </div>
              <div className="text-xs text-gray-500 truncate w-full text-center">
                {data.date.slice(5)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center text-gray-500">
          暂无数据
        </div>
      )}

      <div className="flex justify-center gap-4 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-600 rounded"></span> 已完成
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-gray-600 rounded"></span> 剩余
        </span>
      </div>
    </div>
  )
}
