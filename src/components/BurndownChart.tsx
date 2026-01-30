import { useMemo } from 'react'
import type { KanbanItem } from '../data/parser'

interface Props {
  items: KanbanItem[]
}

export default function BurndownChart({ items }: Props) {
  const chartData = useMemo(() => {
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
    // Type breakdown
    const ideas = items.filter(i => i.type === 'idea').length
    const research = items.filter(i => i.type === 'research').length
    const build = items.filter(i => i.type === 'build').length
    // Stage breakdown
    const backlog = items.filter(i => i.stage === 'backlog').length
    const inProgress = items.filter(i => i.stage === 'in_progress').length
    const done = items.filter(i => i.stage === 'done').length

    return { total, ideas, research, build, backlog, inProgress, done }
  }, [items])

  const maxValue = Math.max(...chartData.map(d => d.total), 1)

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold">📈 进度燃尽图</h3>

      {/* Type Breakdown */}
      <div>
        <h4 className="text-sm text-gray-400 mb-2">类型分布</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-yellow-900/30 rounded">
            <div className="text-2xl font-bold text-yellow-400">{stats.ideas}</div>
            <div className="text-xs text-gray-400">💡 Ideas</div>
          </div>
          <div className="text-center p-2 bg-purple-900/30 rounded">
            <div className="text-2xl font-bold text-purple-400">{stats.research}</div>
            <div className="text-xs text-gray-400">🔍 Research</div>
          </div>
          <div className="text-center p-2 bg-blue-900/30 rounded">
            <div className="text-2xl font-bold text-blue-400">{stats.build}</div>
            <div className="text-xs text-gray-400">🛠️ Build</div>
          </div>
        </div>
      </div>

      {/* Stage Breakdown */}
      <div>
        <h4 className="text-sm text-gray-400 mb-2">阶段分布</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gray-700 rounded">
            <div className="text-2xl font-bold">{stats.backlog}</div>
            <div className="text-xs text-gray-400">⬜ Backlog</div>
          </div>
          <div className="text-center p-2 bg-blue-900/30 rounded">
            <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
            <div className="text-xs text-gray-400">🔵 In Progress</div>
          </div>
          <div className="text-center p-2 bg-green-900/30 rounded">
            <div className="text-2xl font-bold text-green-400">{stats.done}</div>
            <div className="text-xs text-gray-400">✅ Done</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
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

      <div className="flex justify-center gap-4 text-xs text-gray-400">
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
