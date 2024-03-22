import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Получаем ID задачи из параметров маршрута
  const routeId = getRouterParam(event, 'id')
  // Получаем обновленные данные задачи из тела запроса
  const updatedTaskData = await readBody(event)

  try {
    // Обновляем задачу в базе данных
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(routeId),
      },
      data: updatedTaskData,
    })

    // Возвращаем обновленную задачу
    return { updatedTask }
  }
  catch (error) {
    // Обработка возможной ошибки, например, если задача не найдена
    return createError({ statusCode: 404, statusMessage: 'Task not found' })
  }
})
