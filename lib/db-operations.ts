import { prisma } from './prisma'
import fs from 'fs'
import path from 'path'

// Function to ensure the database file exists
export async function ensureDbExists() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  
  if (!fs.existsSync(dbPath)) {
    // Create empty database file
    fs.writeFileSync(dbPath, '')
    
    // Run migrations
    try {
      await prisma.$executeRaw`PRAGMA foreign_keys = ON;`
      console.log('Database initialized successfully')
    } catch (error) {
      console.error('Error initializing database:', error)
    }
  }
} 