import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Получаем массив ID задач из тела запроса
  const selectedTaskIds = await readBody(event)
  console.log(selectedTaskIds)
  try {
    // Массово удаляем задачи
    const deletedTasks = await prisma.task.deleteMany({
      where: {
        id: {
          in: selectedTaskIds.ids,
        },
      },
    })

    // Возвращаем количество удаленных задач
    return { count: deletedTasks.count }
  }
  catch (error) {
    // Обработка возможных ошибок
    return createError({ statusCode: 500, statusMessage: 'Error deleting tasks' })
  }
})
