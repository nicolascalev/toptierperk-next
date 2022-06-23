const { PrismaClient } = require('@prisma/client')

declare module globalThis {
  var prisma: PrismaClient;
}