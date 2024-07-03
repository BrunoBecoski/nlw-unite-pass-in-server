import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function deleteEvent(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/delete/event/:id', {
      schema: {
        summary: 'Delete an event',
        tags: ['delete', 'event'],
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    }, async (request, reply) => {
      const { id } = request.params

      const event = await prisma.event.findUnique({
        where: {
          id,
        }
      })

      if (event == null) {
        throw new BadRequest('Event not found.')
      }

      await prisma.event.delete({
        where: {
          id,
        }
      })

      return reply.status(204).send()
    })
}