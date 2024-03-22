import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Получаем массив ID задач из тела запроса
  const selectedTaskIds = await readBody(event)

  try {
    // Массово обновляем задачи, устанавливая done = true
    const updatedTasks = await prisma.task.updateMany({
      where: {
        id: {
          in: selectedTaskIds.ids,
        },
      },
      data: {
        done: true,
      },
    })

    // Возвращаем количество обновленных задач
    return { count: updatedTasks.count }
  }
  catch (error) {
    // Обработка возможных ошибок
    return createError({ statusCode: 500, statusMessage: 'Error updating tasks' })
  }
})
