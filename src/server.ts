import fastify from 'fastify'

const app = fastify()

app.get('/', () => {
  return 'Hello NLW Unite'
})

app.get('/teste', () => {
  return 'Hello teste'
})

app.listen({ port: 3333}).then(() => {
  console.log('🚀 HTTP server running!')
})
