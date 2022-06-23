// IMPORTANT: right now this is the recommended implementation of prisma client
// but it still shows a warning of connection pools on development and i think
// it is because I didn't run the server once but i've been calling it on each main function
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma
