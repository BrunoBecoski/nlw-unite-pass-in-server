import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function checkInEventAttendee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/check-in/event/:eventId/attendee/:attendeeId', {
      schema: {
        summary: 'Check in an event attendee',
        tags: ['check-in', 'event', 'attendee'],
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
          startDate: true,
          endDate: true,
        }
      })

      if (event == null) {
        throw new BadRequest('Evento não encontrado.')
      }

      const attendee = await prisma.attendee.findUnique({
        where: {
          id: attendeeId,
        }
      })

      if (attendee == null) {
        throw new BadRequest('Participante não encontrado.')
      }

      const existingEventAttendee = await prisma.eventAttendee.findUnique({
        where: {
          eventId_attendeeId: {
            eventId,
            attendeeId,
          }
        }
      })

      if (existingEventAttendee == null) {
        throw new BadRequest('Participante não está registrado no evento.')
      }

      if (event.startDate >= new Date()) {
        throw new BadRequest('Evento não começou.')
      }

      if (event.endDate <= new Date()) {
        throw new BadRequest('Evento terminou.')
      }



      await prisma.eventAttendee.update({
        where: {
          eventId_attendeeId: {
            eventId,
            attendeeId,
          }
        },
        data: {
          checkIn: true
        }
      })

      return reply.status(204).send()
    })
}