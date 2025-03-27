import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'

import { errorHandler } from './error-handler'

import { createAttendee } from './routes/attendee/create-attendee'
import { getAttendee } from './routes/attendee/get-attendee'
import { getAttendees } from './routes/attendee/get-attendees'
import { getAttendeeEvents } from './routes/attendee/get-attendee-events'
import { updateAttendee } from './routes/attendee/update-attendee'
import { updateAttendeeCode } from './routes/attendee/update-attendee-code'
import { deleteAttendee } from './routes/attendee/delete-attendee'

import { createEvent } from './routes/event/create-event'
import { getEvent } from './routes/event/get-event'
import { getEvents } from './routes/event/get-events'
import { getEventAttendees } from './routes/event/get-event-attendees'
import { updateEvent } from './routes/event/update-event'
import { deleteEvent } from './routes/event/delete-event'

import { createEventAttendee } from './routes/eventAttendee/create-eventAttendee'
import { checkInEventAttendee } from './routes/eventAttendee/check-in-eventAttendee'
import { deleteEventAttendee } from './routes/eventAttendee/delete-eventAttendee'

export const app = fastify()

app.register(fastifyCors, {
  origin: '*',
})

app.register(fastifySwagger ,{
  swagger: {
    consumes: ['application/json'],
    produces: ['application/json'],
    info: {
      title: 'pass-in-server',
      description: 'Especificações da API para o back-end da aplicação pass.in construída durante o NLW Unite da Rocketseat.',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
}) 

app.register(fastifySwaggerUI, {
  routePrefix: '/docs'
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createAttendee)
app.register(getAttendee)
app.register(getAttendeeEvents)
app.register(updateAttendee)
app.register(updateAttendeeCode)
app.register(deleteAttendee)
app.register(getAttendees)

app.register(createEvent)
app.register(getEvent)
app.register(getEvents)
app.register(getEventAttendees)
app.register(updateEvent)
app.register(deleteEvent)

app.register(createEventAttendee)
app.register(checkInEventAttendee)
app.register(deleteEventAttendee)

app.setErrorHandler(errorHandler)

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('🚀 HTTP server running!')
})
