interface Task {
  id: number
  title: string
  content?: string
  done: boolean
  created_at: string
  priority: keyof typeof PriorityColors | string
}
