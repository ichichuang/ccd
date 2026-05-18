import { z } from 'zod'

export const jsonPlaceholderPostSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
})

export type JsonPlaceholderPostDTO = z.infer<typeof jsonPlaceholderPostSchema>
