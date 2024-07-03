import { faker } from '@faker-js/faker'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'

import { prisma } from '../src/lib/prisma'

async function seed() {
  await prisma.event.deleteMany()
  await prisma.attendee.deleteMany()
  await prisma.eventAttendee.deleteMany()

  const eventId = 'cb9108f2-8d99-4d30-bfa1-bb6e3bb41da0'

  await prisma.event.create({
    data: {
      id: eventId,
      title: 'Unite Summit',
      slug: 'unite-summit',
      details: 'Um evento p/ DEVs apaixonados(as) por código!',
      maximumAttendees: 125,
      startDate: new Date("07-01-2024 "),
      endDate: new Date("07-07-2024"),
    }
  })

  const attendeeId = 'b8d15ef3-d90f-4c7a-b393-4bec8fbf2681'

  await prisma.attendee.create({
    data: {
      id: attendeeId,
      name: 'Bruno Becoski',
      email: 'bruno@email.com',
      code: '00001',
    }
  })

  await prisma.eventAttendee.create({
    data: {
      eventId,
      attendeeId,
      checkIn: true,
    }
  })

  const eventsToInsert: Prisma.EventCreateManyInput[] = []

  for (let i = 0; i <= 20; i++) {
    eventsToInsert.push({
      title: faker.lorem.sentence({ min: 1, max: 3 }),
      slug: faker.lorem.slug(),
      maximumAttendees: faker.number.int({ min: 1, max: 1000 }),
      details: faker.lorem.sentence(),
      startDate: faker.date.recent({ days: 30 }),
      endDate: faker.date.recent({ days: 7 }),
    })
  }

  const attendeesToInsert: Prisma.AttendeeUncheckedCreateInput[] = []
  
  for (let i = 1; i <= 50; i++) {
    attendeesToInsert.push({
      name: faker.person.fullName(),
      email: faker.internet.email().toLocaleLowerCase(),
      createdAt: faker.date.recent({ days: 30, refDate: dayjs().subtract(8, "days").toDate() }),
      code: faker.number.int({ min: 10000, max: 99999 }).toString()
    })
  }
      
  await Promise.all(
    attendeesToInsert.map(data => {
      return prisma.attendee.create({ data })
    })
  )
  
  await Promise.all(
    eventsToInsert.map(data => {
      return prisma.event.create({ data })
    })
  )
}

seed().then(() => {
  console.log('🌱 Database Seeded!')
  prisma.$disconnect()
})