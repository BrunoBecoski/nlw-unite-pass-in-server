import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function getAttendee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/get/attendee/:id', {
      schema: {
        summary: 'Get attendee',
        tags: ['get', 'attendee'],
        params: z.object({
          id: z.string().uuid(),
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
                }),
              ),
            }),
          },
        )},
      }, 
    }, async (request, reply) => {
      const { id } = request.params

      const attendee = await prisma.attendee.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          code: true,
          name: true,
          email: true,

          events: {
            select: {
              event: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                }
              }
            }
          }
        }
      })

      if (attendee == null) {
        throw new BadRequest('Attendee not found.')
      }
      
      const events = attendee.events.map(({ event }) => {      
        return {
          id: event.id,
          slug: event.slug,
          title: event.title,
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