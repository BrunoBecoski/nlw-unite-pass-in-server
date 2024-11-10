import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'

export async function getAttendees(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/get/attendees',{
      schema: {
        summary: 'Get Attendees',
        tags: ['get', 'attendees'],
        querystring: z.object({
          pageIndex: z.string().nullish().default('1').transform(Number),
          query: z.string().nullish(),
        }),
        response: {
          200: z.object({
            attendees: z.array(
              z.object({
                id: z.string().uuid(),
                code: z.string(),
                name: z.string(),
                email: z.string().email(),
                events: z.number(),
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
            code: true,
            name: true,
            email: true,
            _count: {
              select: {
                events: true,
              },
            },
          },
          where: query ? {
            name: {
              contains: query,
            } 
          } : {},
          take: 10,
          skip: (pageIndex - 1) * 10,
          orderBy: {
            createdAt: 'desc'
          },        
        }),
        prisma.attendee.count({
          where: query ? {
            name: {
              contains: query,
            },
          } : {},
        }),
      ])

      return reply.status(200).send({
        attendees: attendees.map(attendee => {
          return {
            id: attendee.id,
            code: attendee.code,
            name: attendee.name,
            email: attendee.email,
            events: attendee._count.events,
          }
        }),
        total,
      })
    })
}