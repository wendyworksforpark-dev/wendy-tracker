export interface KanbanItem {
  title: string
  description?: string
  type: 'idea' | 'research' | 'build'
  stage: 'backlog' | 'in_progress' | 'done'
  date?: string
  github_issue?: number
  repo?: string
}

export interface TodoItem {
  id: string
  text: string
  done: boolean
  time?: string
  priority?: string
  type?: 'idea' | 'research' | 'build'
  status?: 'completed' | 'in_progress' | 'pending'
}

export function parseIdeasMd(content: string): KanbanItem[] {
  const items: KanbanItem[] = []

  // Track the old section to map into type + stage
  let currentSection: 'brainstorm' | 'idea' | 'product' | 'done' | null = null

  const lines = content.split('\n')

  for (const line of lines) {
    const lowerLine = line.toLowerCase()

    // Detect section headers
    if (line.startsWith('## ')) {
      if (lowerLine.includes('brainstorm')) {
        currentSection = 'brainstorm'
      } else if (lowerLine.includes('idea') && !lowerLine.includes('brainstorm')) {
        currentSection = 'idea'
      } else if (lowerLine.includes('product')) {
        currentSection = 'product'
      } else if (lowerLine.includes('done') || lowerLine.includes('完成')) {
        currentSection = 'done'
      }
      continue
    }

    // Parse list items
    if (currentSection && line.match(/^-\s+\[/)) {
      const itemText = line.replace(/^-\s+/, '').trim()

      // Extract date if present [YYYY-MM-DD]
      const dateMatch = itemText.match(/\[(\d{4}-\d{2}-\d{2})\]/)
      const date = dateMatch ? dateMatch[1] : undefined

      // Extract title and description (split by " - ")
      const textWithoutDate = itemText.replace(/\[\d{4}-\d{2}-\d{2}\]\s*/, '')
      const parts = textWithoutDate.split(' - ')
      const title = parts[0].trim()
      const description = parts.slice(1).join(' - ').trim() || undefined

      // Map old sections → type + stage
      let type: KanbanItem['type']
      let stage: KanbanItem['stage']

      switch (currentSection) {
        case 'brainstorm':
          type = 'idea'
          stage = 'backlog'
          break
        case 'idea':
          type = 'idea'
          stage = 'in_progress'
          break
        case 'product':
          type = 'build'
          stage = 'in_progress'
          break
        case 'done':
          // Try to infer type from tags/content; default to build
          if (lowerLine.includes('research') || lowerLine.includes('调研')) {
            type = 'research'
          } else if (lowerLine.includes('idea') || lowerLine.includes('想法')) {
            type = 'idea'
          } else {
            type = 'build'
          }
          stage = 'done'
          break
        default:
          type = 'idea'
          stage = 'backlog'
      }

      if (title) {
        items.push({ title, description, type, stage, date })
      }
    }
  }

  return items
}

export function parseTodoMd(content: string): TodoItem[] {
  const items: TodoItem[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    const match = line.match(/^-\s+\[([ x])\]\s+(.+)$/)
    if (match) {
      const done = match[1] === 'x'
      const text = match[2].trim()

      const timeMatch = text.match(/\((\d{1,2}:\d{2})\)/)
      const time = timeMatch ? timeMatch[1] : undefined

      const priorityMatch = text.match(/\[(P[012])\]/)
      const priority = priorityMatch ? priorityMatch[1] : undefined

      items.push({
        id: Math.random().toString(36).slice(2),
        text: text.replace(/\(\d{1,2}:\d{2}\)/, '').replace(/\[P[012]\]/, '').trim(),
        done,
        time,
        priority,
      })
    }
  }

  return items
}
