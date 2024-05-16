import { faker } from '@faker-js/faker'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'

import { prisma } from '../src/lib/prisma'

async function seed() {
  const eventId = 'cb9108f2-8d99-4d30-bfa1-bb6e3bb41da0'

  await prisma.event.deleteMany()

  await prisma.event.create({
    data: {
      id: eventId,
      title: 'Unite Summit',
      slug: 'unite-summit',
      details: 'Um evento p/ devs apaixonados(as) por código!',
      maximumAttendees: 125,
      startDate: new Date("04-01-2024 "),
      endDate: new Date("04-07-2024"),
      virtualEvent: true,
      physicalEvent: false,
      checkInAfterStart: true,
    }
  })

  const eventsToInsert: Prisma.EventCreateManyInput[] = []

  for (let i = 0; i <= 25; i++) {
    eventsToInsert.push({
      title: faker.lorem.sentence({ min: 1, max: 3 }),
      slug: faker.lorem.slug(),
      maximumAttendees: faker.number.int({ min: 1, max: 1000 }),
      details: faker.lorem.sentence(),
      startDate: faker.date.recent({ days: 30 }),
      endDate: faker.date.recent({ days: 7 }),
      virtualEvent: faker.datatype.boolean({ probability: 1 }),
      physicalEvent: faker.datatype.boolean(),
      checkInAfterStart: faker.datatype.boolean(),
    })
  }

  const attendeesToInsert: Prisma.AttendeeUncheckedCreateInput[] = []
  
  for (let i = 1; i <= 125; i++) {
    attendeesToInsert.push({
      name: faker.person.fullName(),
      email: faker.internet.email().toLocaleLowerCase(),
      createdAt: faker.date.recent({ days: 30, refDate: dayjs().subtract(8, "days").toDate() }),
    })
  }
  
  const eventsAttendeesToInsert: Prisma.EventAttendeeUncheckedCreateInput[] = []

  for (let i = 1; i <= 25; i++) {
    eventsAttendeesToInsert.push({
      eventId: faker.string.uuid(),
      attendeeId: faker.string.uuid(),
      checkIn: faker.datatype.boolean(),
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
  
  await Promise.all(
    eventsAttendeesToInsert.map(data => {
      return prisma.eventAttendee.create({ data })
    })
  )
}

seed().then(() => {
  console.log('🌱 Database Seeded!')
  prisma.$disconnect()
})