import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const routeId = getRouterParam(event, 'id')
  const updatedTaskData = await readBody(event)

  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(routeId),
      },
      data: updatedTaskData,
    })

    return { updatedTask }
  }
  catch (error) {
    return createError({ statusCode: 404, statusMessage: 'Task not found' })
  }
})
