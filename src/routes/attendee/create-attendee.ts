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
        tags: ['create', 'attendees'],
        body: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        response: {
          201: z.object({
            attendeeId: z.string().uuid(),
            code: z.string(),
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
        throw new BadRequest('Another attendee with same title already exists.')
      }

      const code = await generateCode()

      const attendee = await prisma.attendee.create({
        data: {
          code,
          name,
          email,
        }
      })

      return reply.status(201).send({ 
        attendeeId: attendee.id,
        code: attendee.code,
      })
    })
}