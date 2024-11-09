import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { generateSlug } from '../../utils/generate-slug'
import { prisma } from '../../lib/prisma'
import { BadRequest } from './../_errors/bad-request'

export async function createEvent(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>() 
    .post('/create/event', {
      schema: {
        summary: 'Create an event',
        tags: ['create', 'event'],
        body: z.object({
          title: z.string().min(4),
          details: z.string(),
          maximumAttendees: z.number().int().positive(),
          startDate: z.coerce.date(),
          endDate: z.coerce.date(),
        }),
        response: {
          201: z.object({
            event: z.object({
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
    
      const { 
        title,
        details,
        maximumAttendees,
        startDate,
        endDate,
      } = request.body

      const slug = generateSlug(title)  

      const eventWithSameSlug = await prisma.event.findUnique({
        where: {
          slug,
        }
      })

      if (eventWithSameSlug !== null) {
        throw new BadRequest('Nome utilizado.')
      }

      const startDateFormatted = new Date(startDate)
      const endDateFormatted = new Date(endDate)

      if (isNaN(startDateFormatted.getTime())) {
        throw new BadRequest('Data de início invalida')
      }

      if (isNaN(endDateFormatted.getTime())) {
        throw new BadRequest('Data de fim inválida')
      }

      if (startDateFormatted > endDateFormatted) {
        throw new BadRequest('Data fim esta antes data de inicio.')
      }

      const event = await prisma.event.create({
        data: {
          slug,
          title,
          details,
          startDate: startDateFormatted,
          endDate: endDateFormatted,
          maximumAttendees,
        }
      })
      
      return reply.status(201).send({
        event: {
          id: event.id,
          title: event.title,
          details: event.details,
          slug: event.slug,
          maximumAttendees: event.maximumAttendees,
          startDate: event.startDate,
          endDate: event.endDate,
        }
      })
    })
}