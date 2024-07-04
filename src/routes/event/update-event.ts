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
        throw new BadRequest('Event not found.')
      }
      
      const slug = generateSlug(title)

      const eventWithSameSlug = await prisma.event.findUnique({
        where: {
          slug,
        }
      })

      if (eventWithSameSlug != null && eventWithSameSlug.id != id) {
        throw new BadRequest('Another event with same slug already exists.')
      }

      const startDateFormatted = new Date(startDate)
      const endDateFormatted = new Date(endDate)
      
      if (isNaN(startDateFormatted.getTime())) {
        throw new BadRequest('Start date is invalid')
      }
      
      if (isNaN(endDateFormatted.getTime())) {
        throw new BadRequest('End date is invalid')
      }
      
      if (startDateFormatted > endDateFormatted) {
        throw new BadRequest('End date is before start date')
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