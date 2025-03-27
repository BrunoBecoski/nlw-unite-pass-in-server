import { faker } from '@faker-js/faker'
import { Prisma } from '@prisma/client'

import { prisma } from '../src/lib/prisma'

async function seed() {
  await prisma.event.deleteMany()
  await prisma.attendee.deleteMany()
  await prisma.eventAttendee.deleteMany()

  const eventsToInsert: Prisma.EventCreateManyInput[] = []

  for (let i = 1; i <= 14; i++) {
    eventsToInsert.push({
      title: faker.lorem.sentence({ min: 1, max: 3 }),
      slug: faker.lorem.slug(),
      maximumAttendees: faker.number.int({ min: 1, max: 100 }),
      details: faker.lorem.sentence(),
      startDate: faker.date.soon({ days: 10 }),
      endDate: faker.date.soon({ days: 30 })
    })
  }

  await Promise.all(
    eventsToInsert.map(data => {
      return prisma.event.create({ data })
    })
  )
  
  const attendeesToInsert: Prisma.AttendeeUncheckedCreateInput[] = []
  
  for (let i = 1; i <= 14; i++) {
    attendeesToInsert.push({
      name: faker.person.fullName(),
      email: faker.internet.email().toLocaleLowerCase(),
      code: faker.number.int({ min: 10000, max: 99999 }).toString()
    })
  }
      
  await Promise.all(
    attendeesToInsert.map(data => {
      return prisma.attendee.create({ data })
    })
  )

  const event = await prisma.event.create({
    data: {
      title: 'Unite Summit',
      slug: 'unite-summit',
      details: 'Um evento p/ DEVs apaixonados(as) por código!',
      maximumAttendees: 125,
      startDate: new Date('07-01-2024'),
      endDate: new Date('07-07-2024'),
    }
  })

  const attendee = await prisma.attendee.create({
    data: {
      name: 'Bruno Becoski',
      email: 'bruno@email.com',
      code: '00001',
    }
  })

  await prisma.eventAttendee.create({
    data: {
      eventId: event.id,
      attendeeId: attendee.id,
      checkIn: true,
    }
  })

  for (let i = 0; i <= 14; i++) {
    const forAttendee = await prisma.attendee.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLocaleLowerCase(),
        code: faker.number.int({ min: 10000, max: 99999 }).toString()
      }
    })

    await prisma.eventAttendee.create({
      data: {
        attendeeId: forAttendee.id,
        eventId: event.id,
        checkIn: faker.datatype.boolean()
      }
    })
  }

  for (let i = 0; i <= 14; i++) {
    const forEvent = await prisma.event.create({
      data: {
        title: faker.lorem.sentence({ min: 1, max: 3 }),
        slug: faker.lorem.slug(),
        maximumAttendees: faker.number.int({ min: 1, max: 100 }),
        details: faker.lorem.sentence(),
        startDate: faker.date.recent({ days: 10 }),
        endDate: faker.date.soon({ days: 10 })
      }
    })

    await prisma.eventAttendee.create({
      data: {
        attendeeId: attendee.id,
        eventId: forEvent.id,
        checkIn: faker.datatype.boolean()
      }
    })
  }
}

seed().then(() => {
  console.log('🌱 Database Seeded!')
  prisma.$disconnect()
})