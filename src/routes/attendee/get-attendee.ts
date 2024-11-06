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
            }),
          },
        )},
      }, 
    }, async (request, reply) => {
      const { code } = request.params

      const attendee = await prisma.attendee.findUnique({
        where: {
          code,
        },

        select: {
          id: true,
          code: true,
          name: true,
          email: true,
        },
      })

      if (attendee == null) {
        throw new BadRequest('Participante não encontrado.')
      }

      const attendeeEvents = await prisma.eventAttendee.findMany({
        where : { attendeeId: attendee.id },
        
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
        }

      })
      
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
        }
      })
    })
}