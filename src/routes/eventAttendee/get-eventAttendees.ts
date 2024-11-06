import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function getEventAttendees(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/get/event/:id/attendees',{
      schema: {
        summary: 'Get Event Attendees',
        tags: ['get', 'event', 'attendees'],
        params: z.object({
          id: z.string().uuid()
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
                email: z.string().email(),
                events: z.number(),
              }),
            ),
            total: z.number(),       
          }),
        },
      },
    }, async (request, reply) => {
      const { id } = request.params
      const { pageIndex, query } = request.query

      const event = await prisma.event.findUnique({
        where: {
          id,
        }
      })

      if (event == null) {
        throw new BadRequest('Evento não encontrado.')
      }

      const [attendees, total] = await Promise.all([
        prisma.attendee.findMany({
          where: query ? {
            name: {
              contains: query,
            },
            events: {
              some: {
                eventId: id,
              }
            }
          } : {
            events: {
              some: {
                eventId: id,
              }
            }
          },
          include: {
            _count: {
              select: {
                events: true
              },
            },
          },
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
            events: {
              some: {
                eventId: id,
              }
            }
          } : {
            events: {
              some: {
                eventId: id
              }
            }
          }
        })
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