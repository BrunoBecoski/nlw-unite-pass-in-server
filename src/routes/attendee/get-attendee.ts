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
            }),
          }),
        },
      }, 
    }, async (request, reply) => {
      const { code } = request.params

      const attendee = await prisma.attendee.findUnique({
        select: {
          id: true,
          code: true,
          name: true,
          email: true,
        },
        where: {
          code,
        },
      })

      if (attendee == null) {
        throw new BadRequest('Participante não encontrado.')
      }

      return reply.status(200).send({
        attendee: {
          id: attendee.id,
          code: attendee.code,
          name: attendee.name,
          email: attendee.email,
        },
      })
    })
}