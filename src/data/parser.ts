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
    // Detect section headers
    const headerMatch = line.match(/^##\s+[🌊💡📋✅]\s*(\w+)/i)
    if (headerMatch) {
      const key = headerMatch[1].toLowerCase()
      if (key.includes('brainstorm')) currentStage = 'brainstorm'
      else if (key.includes('idea')) currentStage = 'idea'
      else if (key.includes('product')) currentStage = 'product'
      else if (key.includes('done')) currentStage = 'done'
      continue
    }
    
    // Parse list items
    if (currentStage && line.match(/^-\s+/)) {
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
    // Match: - [ ] or - [x] followed by text
    const match = line.match(/^-\s+\[([ x])\]\s+(.+)$/)
    if (match) {
      const done = match[1] === 'x'
      const text = match[2].trim()
      
      // Extract time if present (HH:MM)
      const timeMatch = text.match(/\((\d{1,2}:\d{2})\)/)
      const time = timeMatch ? timeMatch[1] : undefined
      
      // Extract priority if present (P0/P1/P2)
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
