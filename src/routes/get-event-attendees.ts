import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../lib/prisma'
import { BadRequest } from './_errors/bad-request'

export async function getEventAttendees(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:slug/attendees', {
      schema: {
        summary: 'Get event attendee',
        tags: ['events'],
        params: z.object({
          slug: z.string(),
        }),
        querystring: z.object({
          pageIndex: z.string().nullish().default('1').transform(Number),
          query: z.string().nullish(),
        }),
        response: {
          200: z.object({
            attendees: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                email: z.string().email(),
                createdAt: z.date(),
                checkedInAt: z.date().nullable(),
              }),
            ),
            eventTitle: z.string(),
            total: z.number(),

          }),
        },
      },
    }, async (request, reply) => {
      const { slug } = request.params
      const { pageIndex, query } = request.query
      
      const event = await prisma.event.findUnique({
        select: {
          id: true,
          title: true,
        },
        where: {
          slug,
        }
      })

      if (event === null) {
        throw new BadRequest('Event not found.')
      }

      const [attendees, total] = await Promise.all([
        prisma.attendee.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            checkIn: {
              select: {
                createdAt: true,
              },
            },
          },
          where: query ? {
            eventId: event.id,
            name: {
              contains: query,
            }
          } : {
          },
          take: 10,
          skip: (pageIndex - 1) * 10,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.attendee.count({
          where: query ? {
            eventId: event.id,
            name: {
              contains: query,
            }
          } : {
            eventId: event.id,
          }
        })
      ])      

      return reply.status(200).send({
        attendees: attendees.map(attendee => {
          return {
            id: attendee.id,
            name: attendee.name,
            email: attendee.email,
            createdAt: attendee.createdAt, 
            checkedInAt: attendee.checkIn?.createdAt ?? null,
          }
        }),
        eventTitle: event.title,
        total,
      })
    })
}