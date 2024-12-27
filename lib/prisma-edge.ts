import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

// Configure WebSocket for Edge runtime
if (!globalThis.WebSocket) {
  neonConfig.webSocketConstructor = ws as any
} else {
  neonConfig.webSocketConstructor = WebSocket
}

// Configure connection pool
const connectionString = process.env.POSTGRES_PRISMA_URL!
const pool = new Pool({ 
  connectionString,
  ssl: true,
  keepAlive: true
})

const adapter = new PrismaNeon(pool)

// Initialize Prisma client with the Neon adapter
export const prismaEdge = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Add Prisma to global scope in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prismaEdge
}
