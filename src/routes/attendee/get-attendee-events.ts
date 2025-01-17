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
        response: {
          200: z.object({
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
          }),
        },
      },
    }, async (request, reply) => {
      const { code } = request.params

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

      const eventsResponse = await prisma.eventAttendee.findMany({
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
            }
          }
        },
        where: {
          attendeeId: attendee.id,
        }
      });
      
      const events = eventsResponse.map(event => ({
        checkIn: event.checkIn,
        id: event.event.id,
        slug: event.event.slug,
        title: event.event.title,
        details: event.event.details,
        startDate: event.event.startDate,
        endDate: event.event.endDate,
      }));
        

      return reply.status(200).send({ events })
    })
}