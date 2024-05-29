import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../lib/prisma'

export async function getEvents(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events', {
      schema: {
        summary: 'Get events',
        tags: ['events'],
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
                attendees: z.number(),
                maximumAttendees: z.number().nullable(),
                startDate: z.date(),
                endDate: z.date(),
                virtualEvent: z.boolean(),
                physicalEvent: z.boolean(),
                checkInAfterStart: z.boolean(),
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
            virtualEvent: true,
            physicalEvent: true,
            checkInAfterStart: true,
            _count: {
              select: {
                attendees: true,
              }
            }
          },
          where: query ? {
            OR: [
              {
                title: {
                  contains: query,
                }
              },
              { 
                details: {
                  contains: query,
                },
              }
            ]            
          } : {},
          take: 10,
          skip: (pageIndex - 1) * 10,
        }),
        prisma.event.count({
          where: query ? {
            OR: [
              {
                title: {
                  contains: query,
                }
              },
              { 
                details: {
                  contains: query,
                },
              }
            ]    
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
            attendees: event._count.attendees,
            maximumAttendees: event.maximumAttendees,
            startDate: event.startDate,
            endDate: event.endDate,
            virtualEvent: event.virtualEvent,
            physicalEvent: event.physicalEvent,
            checkInAfterStart: event.checkInAfterStart,
          }
        }) ,
        total,
      })
    })
}