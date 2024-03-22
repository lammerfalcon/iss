import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  let whereClause = {}

  if (query.done !== undefined) {
    const isDone = query.done === '1'
    whereClause = { done: isDone }
  }

  return prisma.task.findMany({
    where: whereClause,
    orderBy: [
      {
        done: 'asc',
      },
      {
        created_at: 'desc',
      },
    ],
  })
})
