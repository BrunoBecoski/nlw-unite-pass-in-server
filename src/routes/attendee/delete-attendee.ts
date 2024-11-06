import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function deleteAttendee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/delete/attendee/:id', {
      schema: {
        summary: 'Delete an attendee',
        tags: ['delete', 'attendee'],
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    }, async (request, reply) => {
      const { id } = request.params

      const attendee = await prisma.attendee.findUnique({
        where: {
          id,
        }
      })

      if (attendee == null) {
        throw new BadRequest('Participante não encontrado.')
      }

      await prisma.attendee.delete({
        where: {
          id,
        }
      })

      return reply.status(204).send()
    })
}