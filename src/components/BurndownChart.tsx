import { useMemo } from 'react'
import { Lightbulb, Search, Wrench } from 'lucide-react'
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
    const ideas = items.filter(i => i.type === 'idea').length
    const research = items.filter(i => i.type === 'research').length
    const build = items.filter(i => i.type === 'build').length
    const backlog = items.filter(i => i.stage === 'backlog').length
    const inProgress = items.filter(i => i.stage === 'in_progress').length
    const done = items.filter(i => i.stage === 'done').length

    return { total, ideas, research, build, backlog, inProgress, done }
  }, [items])

  const maxValue = Math.max(...chartData.map(d => d.total), 1)
  const completionPercent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Top stats row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Type cards */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-amber-500" />
            <span className="text-sm font-medium text-slate-600">Ideas</span>
          </div>
          <div className="text-2xl font-semibold text-slate-800">{stats.ideas}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search size={16} className="text-purple-500" />
            <span className="text-sm font-medium text-slate-600">Research</span>
          </div>
          <div className="text-2xl font-semibold text-slate-800">{stats.research}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wrench size={16} className="text-indigo-500" />
            <span className="text-sm font-medium text-slate-600">Build</span>
          </div>
          <div className="text-2xl font-semibold text-slate-800">{stats.build}</div>
        </div>
      </div>

      {/* Stage breakdown */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-medium text-slate-600 mb-4">阶段分布</h3>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs text-slate-500">Backlog</span>
            </div>
            <div className="text-xl font-semibold text-slate-700">{stats.backlog}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-500">In Progress</span>
            </div>
            <div className="text-xl font-semibold text-blue-600">{stats.inProgress}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500">Done</span>
            </div>
            <div className="text-xl font-semibold text-emerald-600">{stats.done}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>完成进度</span>
            <span className="font-medium">{completionPercent}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-medium text-slate-600 mb-4">燃尽图</h3>
        {chartData.length > 0 ? (
          <>
            <div className="h-40 flex items-end gap-1.5">
              {chartData.slice(-14).map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse gap-0.5">
                    <div
                      className="w-full bg-emerald-400 rounded-t transition-all"
                      style={{ height: `${(data.done / maxValue) * 120}px` }}
                      title={`完成: ${data.done}`}
                    />
                    <div
                      className="w-full bg-slate-200 rounded-t transition-all"
                      style={{ height: `${(data.remaining / maxValue) * 120}px` }}
                      title={`剩余: ${data.remaining}`}
                    />
                  </div>
                  <div className="text-xs text-slate-400 truncate w-full text-center">
                    {data.date.slice(5)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-5 mt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-emerald-400 rounded" /> 已完成
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-slate-200 rounded" /> 剩余
              </span>
            </div>
          </>
        ) : (
          <div className="h-40 flex items-center justify-center text-sm text-slate-400">
            暂无数据
          </div>
        )}
      </div>
    </div>
  )
}
