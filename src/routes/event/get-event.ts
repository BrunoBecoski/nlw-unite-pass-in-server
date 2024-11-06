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
            }),
          },
        )},
      },
    }, async (request, reply) => {
      const { slug } = request.params
      
      const event = await prisma.event.findUnique({
        where: {
          slug,
        },

        select: {
          id: true,
          title: true,
          slug: true,
          details: true,
          maximumAttendees: true,
          startDate: true,
          endDate: true,
        },
      })

      if (event === null) {
        throw new BadRequest('Evento não encontrado.')
      }

      const eventAttendees = await prisma.eventAttendee.findMany({
        where: { eventId: event.id },

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
        }
      })

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
        }
      })
    })
}