export interface KanbanItem {
  title: string
  description?: string
  date?: string
  stage: 'brainstorm' | 'idea' | 'product' | 'done'
}

export interface TodoItem {
  id: string
  text: string
  done: boolean
  time?: string
  priority?: string
}

export function parseIdeasMd(content: string): KanbanItem[] {
  const items: KanbanItem[] = []
  
  let currentStage: KanbanItem['stage'] | null = null
  
  const lines = content.split('\n')
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    
    // Detect section headers - more flexible matching
    if (line.startsWith('## ')) {
      if (lowerLine.includes('brainstorm')) {
        currentStage = 'brainstorm'
      } else if (lowerLine.includes('idea') && !lowerLine.includes('brainstorm')) {
        currentStage = 'idea'
      } else if (lowerLine.includes('product')) {
        currentStage = 'product'
      } else if (lowerLine.includes('done') || lowerLine.includes('完成')) {
        currentStage = 'done'
      }
      continue
    }
    
    // Parse list items
    if (currentStage && line.match(/^-\s+\[/)) {
      const itemText = line.replace(/^-\s+/, '').trim()
      
      // Extract date if present [YYYY-MM-DD]
      const dateMatch = itemText.match(/\[(\d{4}-\d{2}-\d{2})\]/)
      const date = dateMatch ? dateMatch[1] : undefined
      
      // Extract title and description (split by " - ")
      const textWithoutDate = itemText.replace(/\[\d{4}-\d{2}-\d{2}\]\s*/, '')
      const parts = textWithoutDate.split(' - ')
      const title = parts[0].trim()
      const description = parts.slice(1).join(' - ').trim() || undefined
      
      if (title) {
        items.push({
          title,
          description,
          date,
          stage: currentStage
        })
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
        priority
      })
    }
  }
  
  return items
}
