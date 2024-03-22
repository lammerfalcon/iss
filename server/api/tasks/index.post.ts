import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const task = await prisma.task.create({
      data: {
        ...body,
      },
    })
    return {
      res: task,
    }
  }
  catch (error: unknown) {
    setResponseStatus(event, 500)
    if (error instanceof Error) {
      return {
        error: error.message,
      }
    }
  }
})
