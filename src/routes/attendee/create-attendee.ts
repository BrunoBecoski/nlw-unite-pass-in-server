import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { generateCode } from '../../utils/generate-code'
import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function createAttendee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/create/attendee', {
      schema: {
        summary: 'Post an attendee',
        tags: ['create', 'attendee'],
        body: z.object({
          name: z.string().min(3),
          email: z.string().email(),
        }),
        response: {
          201: z.object({
            attendee: z.object({
              id: z.string().uuid(),
              code: z.string(),
              name: z.string(),
              email: z.string().email(),
            })
          }),
        },
      },
    }, async (request, reply) => {
      const { name, email } = request.body

      const attendeeWithSameEmail = await prisma.attendee.findUnique({
        where: {
          email,
        }
      })

      if (attendeeWithSameEmail != null) {
        throw new BadRequest('Email está sendo utilizado.')
      }

      const code = await generateCode()

      const attendee = await prisma.attendee.create({
        data: {
          code,
          name,
          email,
        },

        select: {
          id: true,
          code: true,
          name: true,
          email: true,
        }
      })

      return reply.status(201).send({
        attendee: {
          id: attendee.id,
          code: attendee.code,
          name: attendee.name,
          email: attendee.email,
        }
      })
    })
}