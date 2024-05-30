import { prisma } from '../lib/prisma'

function generateRandomNumber() {
  return Math.floor(Math.random() * 100000).toString().padStart(5, '0')
}

export async function generateCode() {
  let uniqueCode = false
  let code = generateRandomNumber()

  while (uniqueCode == false) {
    code = generateRandomNumber()

    const attendeeWithSameCode = await prisma.attendee.findUnique({
      where: {
        code,
      },
    })

    if (attendeeWithSameCode == null) {
      uniqueCode = true
    }
  }

  return code;
}
