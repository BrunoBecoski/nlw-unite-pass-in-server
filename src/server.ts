import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'

import { createEvent } from './routes/create-event'
import { registerForEvent } from './routes/register-for-event'
import { getEvent } from './routes/get-event'
import { getAttendeeBadge } from './routes/get-attendee-badge'
import { checkIn } from './routes/check-in'
import { getEventAttendees } from './routes/get-event-attendees'
import { errorHandler } from './error-handler'
import { getEvents } from './routes/get-events'

import { createAttendee } from './routes/attendee/create-attendee'
import { getAttendee } from './routes/attendee/get-attendee'
import { updateAttendee } from './routes/attendee/update-attendee'
import { updateAttendeeCode } from './routes/attendee/update-attendee-code'
import { deleteAttendee } from './routes/attendee/delete-attendee'
import { getAttendees } from './routes/attendee/get-attendees'

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

app.register(checkIn)
app.register(registerForEvent)
app.register(getAttendeeBadge)

app.register(getEvent)
app.register(getEvents)
app.register(createEvent)

app.register(createAttendee)
app.register(getAttendee)
app.register(updateAttendee)
app.register(updateAttendeeCode)
app.register(deleteAttendee)
app.register(getAttendees)

app.register(getEventAttendees)

app.setErrorHandler(errorHandler)

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('🚀 HTTP server running!')
})
