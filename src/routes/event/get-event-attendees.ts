import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function getEventAttendees(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/get/event/:slug/attendees', {
      schema: {
        summary: 'Get an event attendees',
        tags: ['get', 'event', 'attendees'],
        params: z.object({
          slug: z.string(),
        }),
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
                email: z.string(),
                checkIn: z.boolean(),
              })
            ),
            attendeesTotal: z.number(),
            checkInTotal: z.number(),
          }),
        },
      },
    }, async (request, reply) => {
      const { slug } = request.params
      const { pageIndex, query } = request.query
      
      const event = await prisma.event.findUnique({
        select: {
          id: true,
          title: true,
          slug: true,
          details: true,
          maximumAttendees: true,
          startDate: true,
          endDate: true,
        },

        where: {
          slug,
        },
      })

      if (event === null) {
        throw new BadRequest('Evento não encontrado.')
      }

      const [attendeesResponse, attendeesTotal, checkInTotal] = await Promise.all([
        prisma.eventAttendee.findMany({
          select: {
            checkIn: true,
            attendee: {
              select: {
                id: true,
                code: true,
                name: true,
                email: true,
              }
            }
          },
          where: query ? {
            eventId: event.id,
            attendee: {
              name: {
                contains: query
              },
            },
          } : { 
            eventId: event.id,
          },
          take: 10,
          skip: (pageIndex - 1) * 10,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.eventAttendee.count({
          where: {
            event: {
              slug,
            },
          }
        }),
        prisma.eventAttendee.count({
          where: {
            checkIn: true,
            event: {
              slug,
            }
          }
        })
      ])

      const attendees = attendeesResponse.map(({ checkIn, attendee }) => {
        return {
          id: attendee.id,
          code: attendee.code,
          name: attendee.name,
          email: attendee.email,
          checkIn,
        }
      })
      
      return reply.status(200).send({ 
        attendees, attendeesTotal, checkInTotal
      })
    })
}