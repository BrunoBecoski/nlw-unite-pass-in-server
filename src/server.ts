import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'

import { getAttendeeBadge } from './routes/get-attendee-badge'
import { errorHandler } from './error-handler'

import { createAttendee } from './routes/attendee/create-attendee'
import { getAttendee } from './routes/attendee/get-attendee'
import { updateAttendee } from './routes/attendee/update-attendee'
import { updateAttendeeCode } from './routes/attendee/update-attendee-code'
import { deleteAttendee } from './routes/attendee/delete-attendee'
import { getAttendees } from './routes/attendee/get-attendees'

import { createEvent } from './routes/event/create-event'
import { getEvent } from './routes/event/get-event'
import { updateEvent } from './routes/event/update-event'
import { deleteEvent } from './routes/event/delete-event'
import { getEvents } from './routes/event/get-events'

import { registerEventAttendee } from './routes/eventAttendee/register-eventAttendee'
import { checkInEventAttendee } from './routes/eventAttendee/check-in-eventAttendee'
import { deleteEventAttendee } from './routes/eventAttendee/delete-eventAttendee'
import { getAttendeeEvents } from './routes/eventAttendee/get-attendeeEvents'
import { getEventAttendees } from './routes/eventAttendee/get-eventAttendees'

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

app.register(getAttendeeBadge)

app.register(createAttendee)
app.register(getAttendee)
app.register(updateAttendee)
app.register(updateAttendeeCode)
app.register(deleteAttendee)
app.register(getAttendees)

app.register(createEvent)
app.register(getEvent)
app.register(updateEvent)
app.register(deleteEvent)
app.register(getEvents)

app.register(registerEventAttendee)
app.register(checkInEventAttendee)
app.register(deleteEventAttendee)
app.register(getAttendeeEvents)
app.register(getEventAttendees)

app.setErrorHandler(errorHandler)

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('🚀 HTTP server running!')
})
