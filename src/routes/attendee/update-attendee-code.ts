import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { generateCode } from '../../utils/generate-code'
import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function updateAttendeeCode(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/update/attendee/code/:id', {
      schema: {
        summary: 'Update an Attendee Code',
        tags: ['update', 'attendee'],
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({
            code: z.string(),
          }),
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

      const code = await prisma.attendee.update({
        where: {
          id,
        },

        data: {
          code: await generateCode(),
        },

        select: {
          code: true,
        },
      })

      return reply.status(200).send(code)
    })
}