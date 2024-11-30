import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function createEventAttendee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/create/event/:slug/attendee/:code', {
      schema: {
        summary: 'Create an event attendee',
        tags: ['create', 'event', 'attendee'],
        params: z.object({
          slug: z.string(),
          code: z.string(),
        }),
        response: {
          200: z.object({
            eventAttendee: z.object({
              eventId: z.string().uuid(),
              attendeeId: z.string().uuid(),
              checkIn: z.boolean(),
              createdAt: z.date(),
            }),
          }),
        },
      },
    }, async (request, reply) => {
      const { slug, code } = request.params

      const event = await prisma.event.findUnique({
        where: {
          slug: slug,
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
        throw new BadRequest('Evento não encontrado.')
      }

      if (event.startDate <= new Date()) {
        throw new BadRequest('Evento começou.')
      }

      if (event.maximumAttendees <= event._count.attendees) {
        throw new BadRequest('Número máximo de participantes para este evento foi atingido.')
      }

      const attendee = await prisma.attendee.findUnique({
        where: {
          code,
        }
      })

      if (attendee == null) {
        throw new BadRequest('Participante não encontrado.')
      }

      const existingEventAttendee = await prisma.eventAttendee.findUnique({
        where: {
          eventId_attendeeId: {
            eventId: event.id,
            attendeeId: attendee.id,
          }
        }
      })

      if (existingEventAttendee != null) {
        throw new BadRequest('Participante já está registrado no evento.')
      }

      const eventAttendee = await prisma.eventAttendee.create({
        data: {
          eventId: event.id,
          attendeeId: attendee.id,
          checkIn: false,
        }
      })

      return reply.status(200).send({ eventAttendee })
    })
}