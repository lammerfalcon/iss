import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const routeId = getRouterParam(event, 'id')
  const res = await prisma.task.delete({
    where: {
      id: Number(routeId),
    },
  })
  return {
    res,
  }
})
