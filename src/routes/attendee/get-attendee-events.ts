import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function getAttendeeEvents(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/get/attendee/:code/events', {
      schema: {
        summary: 'Get an attendee events',
        tags: ['get', 'attendee', 'events'],
        params: z.object({
          code: z.string(),
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
                startDate: z.date(),
                endDate: z.date(),
                checkIn: z.boolean(),
              }),
            ),
            eventsTotal: z.number(),
            checkInTotal: z.number(),
          }),
        },
      },
    }, async (request, reply) => {
      const { code } = request.params
      const { pageIndex, query } = request.query

      const attendee = await prisma.attendee.findUnique({
        select: {
          id: true,
        },
        where: {
          code,
        }
      })
      
      if (attendee == null) {
        throw new BadRequest('Participante não encontrado.')
      }

      const [eventsResponse, eventsTotal, checkInTotal] = await Promise.all([
        prisma.eventAttendee.findMany({
          select: {
            checkIn: true,
            event: {
              select: {
                id: true,
                slug: true,
                title: true,
                startDate: true,
                endDate: true,
              }
            }
          },
          where: query ? {
            attendeeId: attendee.id,
            event: {
              title: {
                contains: query,
              }
            }
          } : {
            attendeeId: attendee.id,
          },
          take: 10,
          skip: (pageIndex - 1) * 10,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.eventAttendee.count({
          where: {
            attendee: {
              code,
            },
          }
        }),
        prisma.eventAttendee.count({
          where: {
            checkIn: true,
            attendee: {
              code,
            }
          }
        })

      ])
      
      const events = eventsResponse.map(({ checkIn, event }) => ({
        checkIn: checkIn,
        id: event.id,
        slug: event.slug,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
      }));

      return reply.status(200).send({
        events, eventsTotal, checkInTotal
      })
    })
}