import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function deleteAttendee(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>()
  .delete('/delete/attendee/:code', {
    schema: {
      summary: 'Delete an attendee',
      tags: ['delete', 'attendee'],
      params: z.object({
        code: z.string()
      }),
      response: {
        200: z.null(),
      },
    },
  }, async (request, reply) => {
    const { code } = request.params

    const attendee = await prisma.attendee.findUnique({
      where: {
        code,
      }
    })

    if (attendee == null) {
      throw new BadRequest('Attendee not found.')
    }

    await prisma.attendee.delete({
      where: {
        code,
      }
    })

    return reply.status(204).send()
  })
}