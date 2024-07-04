import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function getEvent(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/get/event/:id', {
      schema: {
        summary: 'Get an event',
        tags: ['get', 'event'],
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({
            event: z.object({
              id: z.string().uuid(),
              title: z.string(),
              slug: z.string(),
              details: z.string().nullable(),
              maximumAttendees: z.number().int().nullable(),
              startDate: z.date(),
              endDate: z.date(),
              attendees: z.array(
                z.object({
                  id: z.string().uuid(),
                  code: z.string(),
                  name: z.string(),
                })
              ),
            }),
          },
        )},
      },
    }, async (request, reply) => {
      const { id } = request.params
      
      const event = await prisma.event.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          title: true,
          slug: true,
          details: true,
          maximumAttendees: true,
          startDate: true,
          endDate: true,

          attendees: {
            select: {
              attendee: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      if (event === null) {
        throw new BadRequest('Event not found.')
      }

      const attendees = event.attendees.map(({ attendee }) => {
        return {
          id: attendee.id,
          code: attendee.code,
          name: attendee.name,
        }
      })

      return reply.status(200).send({ 
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          details: event.details,
          maximumAttendees: event.maximumAttendees,
          startDate: event.startDate,
          endDate: event.endDate,
          attendees,
        }
      })
    })
}