import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  let whereClause = {}

  if (query.done !== undefined) {
    const isDone = query.done === 'true'
    whereClause = { done: isDone }
  }

  // Возвращаем отфильтрованный список задач
  return prisma.task.findMany({
    where: whereClause, // Применяем фильтр
    orderBy: [
      {
        done: 'asc', // Сначала false, потом true
      },
      {
        created_at: 'desc',
      },
    ],
  })
})
