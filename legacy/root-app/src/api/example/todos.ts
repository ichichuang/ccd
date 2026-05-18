import { z } from 'zod'
import type { alovaInstance } from '@/utils/http/instance'

const JSONPLACEHOLDER_TODOS_URL = 'https://jsonplaceholder.typicode.com/todos'

export const todoSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
})

export type TodoDTO = z.infer<typeof todoSchema>

export const buildExampleTodoDetailMethod = (client: typeof alovaInstance, id: number | string) =>
  client.Get<TodoDTO>(`${JSONPLACEHOLDER_TODOS_URL}/${id}`)
