import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function getAttendee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/get/attendee/:code', {
      schema: {
        summary: 'Get an attendee',
        tags: ['get', 'attendee'],
        params: z.object({
          code: z.string(),
        }),
        querystring: z.object({
          pageIndex: z.string().nullish().default('1').transform(Number),
          query: z.string().nullish(),
        }),
        response: {
          200: z.object({
            attendee: z.object({
              id: z.string().uuid(),
              code: z.string(),
              name: z.string(),
              email: z.string().email(),
              events: z.array(
                z.object({
                  id: z.string().uuid(),
                  slug: z.string(),
                  title: z.string(),
                  details: z.string(),
                  startDate: z.date(),
                  endDate: z.date(),
                  checkIn: z.boolean(),
                }),
              ),
            total: z.number(),
            }),
          },
        )},
      }, 
    }, async (request, reply) => {
      const { code } = request.params
      const { pageIndex, query } = request.query

      const attendee = await prisma.attendee.findUnique({
        select: {
          id: true,
          code: true,
          name: true,
          email: true,
        },
        where: {
          code,
        },
      })

      if (attendee == null) {
        throw new BadRequest('Participante não encontrado.')
      }

      const [attendeeEvents, total] = await Promise.all([
        prisma.eventAttendee.findMany({
          select: { 
            checkIn: true,
            event: {
              select: {
                id: true,
                slug: true,
                title: true,
                details: true,
                startDate: true,
                endDate: true,
              },
            },
          },
          where: query ? {
            attendeeId: attendee.id,
            event: {
              title: {
                contains: query
              },
            },
          } : {
            attendeeId: attendee.id 
          },
          take: 10,
          skip: (pageIndex - 1) * 10,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.eventAttendee.count({
          where: query ? {
            attendee: {
              code,
            },
            event: {
              title: {
                contains: query,
              }
            },
          } : {
            attendee: {
              code,
            },
          }
        }),
      ])
      
      const events = attendeeEvents.map(({ checkIn, event }) => {      
        return {
          id: event.id,
          slug: event.slug,
          title: event.title,
          details: event.details,
          startDate: event.startDate,
          endDate: event.endDate,
          checkIn,
        }
      })

      return reply.status(200).send({
        attendee: {
          id: attendee.id,
          code: attendee.code,
          name: attendee.name,
          email: attendee.email,
          events,
          total,
        },
      })
    })
}