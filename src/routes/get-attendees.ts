import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../lib/prisma'

export async function getAttendees(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendees',{
      schema: {
        summary: 'Get Attendees',
        tags: ['attendees'],
        querystring: z.object({
          pageIndex: z.string().nullish().default('1').transform(Number),
          query: z.string().nullish(),
        }),
        response: {
          200: z.object({
            attendees: z.array(
              z.object({
                id: z.string().uuid(),
                name: z.string(),
                email: z.string().email(),
              }),
            ),
            total: z.number(),       
          }),
        },
      },
    }, async (request, reply) => {
      const { pageIndex, query } = request.query

      const [attendees, total] = await Promise.all([
        prisma.attendee.findMany({
          select: {
            id: true,
            name: true,
            email: true,
          },
          where: query ? {
            name: {
              contains: query,
            } 
          } : {
          },
            take: 10,
            skip: (pageIndex - 1) * 10,
            orderBy: {
              createdAt: 'desc'
            },        
        }),
        prisma.attendee.count()
      ])

      return reply.status(200).send({
        attendees: attendees.map(attendee => {
          return {
            id: attendee.id,
            name: attendee.name,
            email: attendee.email,
          }
        }),
        total,
      })
    })
}