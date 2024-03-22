import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const task = await prisma.task.findUnique({
    where: {
      id: body.id,
    },
  })

  if (!task)
    return { error: 'Task not found' }

  const updatedTask = await prisma.task.update({
    where: {
      id: body.id,
    },
    data: {
      done: !task.done,
    },
  })

  return { updatedTask }
})
