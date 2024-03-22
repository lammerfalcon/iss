import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const selectedTaskIds = await readBody(event)

  try {
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

    return { count: updatedTasks.count }
  }
  catch (error) {
    return createError({ statusCode: 500, statusMessage: 'Error updating tasks' })
  }
})
