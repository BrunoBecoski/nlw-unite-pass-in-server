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
              slug: z.string(),
              title: z.string(),
              details: z.string().nullable(),
              maximumAttendees: z.number().int().nullable(),
              startDate: z.date(),
              endDate: z.date(),
            }),
          },
        )},
      },
    }, async (request, reply) => {
      const { slug } = request.params
      
      const event = await prisma.event.findUnique({
        select: {
          id: true,
          slug: true,
          title: true,
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
      
      return reply.status(200).send({ 
        event: {
          id: event.id,
          slug: event.slug,
          title: event.title,
          details: event.details,
          maximumAttendees: event.maximumAttendees,
          startDate: event.startDate,
          endDate: event.endDate,
        }
      })
    })
}