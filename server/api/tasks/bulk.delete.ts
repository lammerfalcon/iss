import { PrismaClient } from '~/prisma/generated/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const selectedTaskIds = await readBody(event)
  try {
    const deletedTasks = await prisma.task.deleteMany({
      where: {
        id: {
          in: selectedTaskIds.ids,
        },
      },
    })

    return { count: deletedTasks.count }
  }
  catch (error) {
    return createError({ statusCode: 500, statusMessage: 'Error deleting tasks' })
  }
})
