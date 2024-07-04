import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'

export async function getEvents(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/get/events', {
      schema: {
        summary: 'Get Events',
        tags: ['get', 'events'],
        querystring: z.object({
          pageIndex: z.string().nullish().default('1').transform(Number),
          query: z.string().nullish(),
        }),
        response: {
          200: z.object({
            events: z.array(
              z.object({
                id: z.string().uuid(),
                slug: z.string(),
                title: z.string(),
                details: z.string().nullable(),
                maximumAttendees: z.number().nullable(),
                startDate: z.date(),
                endDate: z.date(),
                attendees: z.number(),
              }),
            ),
            total: z.number(),
          }),          
        },
      },
    }, async (request, reply) => {
      const { pageIndex, query } = request.query

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          select: {
            id: true,
            title: true,
            slug: true,
            details: true,
            maximumAttendees: true,
            startDate: true,
            endDate: true,
            _count: {
              select: {
                attendees: true,
              },
            },
          },
          where: query ? {
            title: {
              contains: query,
            },
          } : {},
          take: 10,
          skip: (pageIndex - 1) * 10,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.event.count({
          where: query ? {
            title: {
              contains: query,
            },  
          } : {},
        }),
      ])

      return reply.status(200).send({
        events: events.map(event => {
          return {
            id: event.id,
            title: event.title,
            slug: event.slug,
            details: event.details,
            maximumAttendees: event.maximumAttendees,
            startDate: event.startDate,
            endDate: event.endDate,
            attendees: event._count.attendees,
          }
        }) ,
        total,
      })
    })
}