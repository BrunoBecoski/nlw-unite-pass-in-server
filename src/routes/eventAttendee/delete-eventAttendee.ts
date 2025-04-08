import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function deleteEventAttendee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/delete/event/:slug/attendee/:code', {
      schema: {
        summary: 'Delete an event attendee',
        tags: ['delete', 'event', 'attendee'],
        params: z.object({
          slug: z.string(),
          code: z.string(),
        }),
        response: {
          204: z.null(),
        },
      },
    }, async (request, reply) => {
      const { slug, code } = request.params

      const event = await prisma.event.findUnique({
        where: {
          slug,
        }
      })

      if (event == null) {
        throw new BadRequest('Evento não encontrado.')
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

      if (existingEventAttendee == null) {
        throw new BadRequest('Evento Participante não encontrado.')
      }

      await prisma.eventAttendee.delete({
        where: {
          eventId_attendeeId: {
            eventId: event.id,
            attendeeId: attendee.id,
          }
        }
      })

      return reply.status(204).send()
    })
}