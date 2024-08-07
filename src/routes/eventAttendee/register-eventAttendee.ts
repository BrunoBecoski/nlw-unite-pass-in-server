import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function registerEventAttendee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/register/event/:eventId/attendee/:attendeeId', {
      schema: {
        summary: 'Register an event attendee',
        tags: ['register', 'event', 'attendee'],
        params: z.object({
          attendeeId: z.string().uuid(),
          eventId: z.string().uuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    }, async (request, reply) => {
      const { eventId, attendeeId } = request.params

      const event = await prisma.event.findUnique({
        where: {
          id: eventId
        },

        select: {
          id: true,
          startDate:true,
          maximumAttendees: true,
          _count: {
            select: {
              attendees: true,
            }
          }
        }
      })

      if (event == null) {
        throw new BadRequest('Event not found.')
      }

      if (event.startDate <= new Date()) {
        throw new BadRequest('Event already start.')
      }

      if (event.maximumAttendees <= event._count.attendees) {
        throw new BadRequest('The maximum number of attendees for this event has been reached.')
      }

      const attendee = await prisma.attendee.findUnique({
        where: {
          id: attendeeId,
        }
      })

      if (attendee == null) {
        throw new BadRequest('Attendee not found.')
      }

      const existingEventAttendee = await prisma.eventAttendee.findUnique({
        where: {
          eventId_attendeeId: {
            eventId,
            attendeeId,
          }
        }
      })

      if (existingEventAttendee != null) {
        throw new BadRequest('EventAttendee already register')
      }

      await prisma.eventAttendee.create({
        data: {
          eventId,
          attendeeId,
          checkIn: false,
        }
      })

      return reply.status(204).send()
    })
}