import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function updateAttendee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/update/attendee', {
      schema: {
        summary: 'Update an Attendee',
        tags: ['update', 'attendee'],
        body: z.object({
          id: z.string().uuid(),
          name: z.string().min(3),
          email: z.string().email(),
        }),
        response: {
          200: z.object({  
            updatedAttendee: z.object({
              id: z.string().uuid(),
              code: z.string(),
              name: z.string(),
              email: z.string().email(),
            })
          }),
        },
      },
    }, async (request, reply) => {
      const { id, email, name } = request.body

      const attendee = await prisma.attendee.findUnique({
        where: {
          id,
        }
      })

      if (attendee == null) {
        throw new BadRequest('Attendee not found.')
      }

      const attendeeWithSameEmail = await prisma.attendee.findUnique({
        where: {
          email,
        }
      })
      
      if (attendeeWithSameEmail != null && attendeeWithSameEmail.id != id) {
        throw new BadRequest('Another attendee with same email already exists.')
      }

      const updatedAttendee = await prisma.attendee.update({
        where: {
          id,
        },

        data: {
          name,
          email,
        },
      })

      return reply.status(200).send({ updatedAttendee })
    })
}