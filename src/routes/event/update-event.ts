import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'
import { generateSlug } from '../../utils/generate-slug'

export async function updateEvent(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/update/event', {
      schema: {
        summary: 'Update an Event',
        tags: ['update', 'event'],
        body: z.object({
          id: z.string().uuid(),
          title: z.string().min(4),
          details: z.string(),
          maximumAttendees: z.number().int().positive(),
          startDate: z.string().min(10),
          endDate: z.string().min(10),
        }),
        response: {
          200: z.object({  
            updatedEvent: z.object({
              id: z.string().uuid(),
              slug: z.string(),
              title: z.string(),
              details: z.string(),
              maximumAttendees: z.number().int().positive(),
              startDate: z.date(),
              endDate: z.date(),
            })
          }),
        },
      },
    }, async (request, reply) => {
      const { id, title, details, maximumAttendees, startDate, endDate } = request.body

      const event = await prisma.event.findUnique({
        where: {
          id,
        },
      })

      if (event == null) {
        throw new BadRequest('Evento não encontrado.')
      }
      
      const slug = generateSlug(title)

      const eventWithSameSlug = await prisma.event.findUnique({
        where: {
          slug,
        }
      })

      if (eventWithSameSlug != null && eventWithSameSlug.id != id) {
        throw new BadRequest('Nome utilizado.')
      }

      const startDateFormatted = new Date(startDate)
      const endDateFormatted = new Date(endDate)
      
      if (isNaN(startDateFormatted.getTime())) {
        throw new BadRequest('Data de início inválida')
      }
      
      if (isNaN(endDateFormatted.getTime())) {
        throw new BadRequest('Data de fim inválida')
      }
      
      if (startDateFormatted > endDateFormatted) {
        throw new BadRequest('Data do fim está antes data de início.')
      }

      const updatedEvent = await prisma.event.update({
        where: {
          id,
        },

        data: {
          slug,
          title,
          details,
          maximumAttendees,
          startDate: startDateFormatted,
          endDate: endDateFormatted,
        },
      })

      return reply.status(200).send({ updatedEvent })
    })
}