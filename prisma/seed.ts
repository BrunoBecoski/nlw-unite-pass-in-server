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
      maximumAttendees: 120,
    }
  })

  const eventsToInsert: Prisma.EventCreateManyInput[] = []

  for (let i = 0; i <= 20; i++) {
    eventsToInsert.push({
      title: faker.lorem.sentence({ min: 1, max: 3 }),
      slug: faker.lorem.slug(),
      maximumAttendees: faker.number.int({ min: 1, max: 1000 }),
      details: faker.lorem.sentence(),
    })
  }

  const attendeesToInsert: Prisma.AttendeeUncheckedCreateInput[] = []

  for (let i = 0; i <= 120; i++) {
    attendeesToInsert.push({
      id: 10000 + i,
      name: faker.person.fullName(),
      email: faker.internet.email().toLocaleLowerCase(),
      eventId,
      createdAt: faker.date.recent({ days: 30, refDate: dayjs().subtract(8, "days").toDate() }),
      checkIn: faker.helpers.arrayElement<Prisma.CheckInUncheckedCreateNestedOneWithoutAttendeeInput | undefined>([
        undefined,
        {
          create: {
            createdAt: faker.date.recent({ days: 7 }),
          }
        }
      ])
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