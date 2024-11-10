import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function getEvent(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/get/event/:slug', {
      schema: {
        summary: 'Get an event',
        tags: ['get', 'event'],
        params: z.object({
          slug: z.string(),
        }),
        querystring: z.object({
          pageIndex: z.string().nullish().default('1').transform(Number),
          query: z.string().nullish(),
        }),
        response: {
          200: z.object({
            event: z.object({
              id: z.string().uuid(),
              title: z.string(),
              slug: z.string(),
              details: z.string().nullable(),
              maximumAttendees: z.number().int().nullable(),
              totalAttendees: z.number().int().nullable(),
              checkInAttendees: z.number().int().nullable(),
              startDate: z.date(),
              endDate: z.date(),
              attendees: z.array(
                z.object({
                  id: z.string().uuid(),
                  code: z.string(),
                  name: z.string(),
                  email: z.string(),
                  checkIn: z.boolean(),
                })
              ),
            total: z.number(),
            }),
          },
        )},
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

      const [eventAttendees, total] = await Promise.all([
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
          where: query ? {
            event: {
              slug,
            },
            attendee: {
              name: {
                contains: query,
              }
            },
          } : {
            event: {
              slug,
            },
          }
        }),
      ])

      const totalAttendees = eventAttendees.length
      const checkInAttendees = eventAttendees.filter(({ checkIn }) => checkIn).length

      const attendees = eventAttendees.map(({ checkIn, attendee }) => {
        return {
          id: attendee.id,
          code: attendee.code,
          name: attendee.name,
          email: attendee.email,
          checkIn,
        }
      })
      
      return reply.status(200).send({ 
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          details: event.details,
          maximumAttendees: event.maximumAttendees,
          totalAttendees,
          checkInAttendees,
          startDate: event.startDate,
          endDate: event.endDate,
          attendees,
          total,
        }
      })
    })
}