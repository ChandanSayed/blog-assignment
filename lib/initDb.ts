import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export async function initializeDatabase() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  const journalPath = path.join(process.cwd(), 'prisma', 'dev.db-journal')

  try {
    // Remove existing database files if they exist
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
    }
    if (fs.existsSync(journalPath)) {
      fs.unlinkSync(journalPath)
    }

    // Push the schema
    await prisma.$executeRaw`PRAGMA journal_mode=DELETE;`
    await prisma.$executeRaw`VACUUM;`

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
  } finally {
    await prisma.$disconnect()
  }
} 