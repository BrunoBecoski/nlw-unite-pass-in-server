import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function getAttendeeEvents(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/get/attendee/:id/events',{
      schema: {
        summary: 'Get Attendee Events',
        tags: ['get', 'attendee', 'events'],
        params: z.object({
          id: z.string().uuid()
        }),
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
      const { id } = request.params
      const { pageIndex, query } = request.query

      const attendee = await prisma.attendee.findUnique({
        where: {
          id,
        }
      })

      if (attendee == null) {
        throw new BadRequest('Attendee not found.')
      }

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where: query ? {
            title: {
              contains: query,
            },
            attendees: {
              some: {
                attendeeId: id,
              }
            }
          } : {
            attendees: {
              some: {
                attendeeId: id,
              }
            }
          },
          include: {
            _count: {
              select: {
                attendees: true
              },
            },
          },
          take: 10,
          skip: (pageIndex - 1) * 10,
          orderBy: {
            createdAt: 'desc'
          },    
        }),
        prisma.event.count({
          where: query ? {
            title: {
              contains: query,
            },
            attendees: {
              some: {
                attendeeId: id,
              }
            }
          } : {
            attendees: {
              some: {
                attendeeId: id
              }
            }
          }
        })
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
        }),
        total,
      })
    })
}