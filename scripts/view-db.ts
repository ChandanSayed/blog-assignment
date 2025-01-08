import { prisma } from '../lib/prisma'
import { join } from 'path'
import { existsSync } from 'fs'

async function main() {
  try {
    const dbPath = join(process.cwd(), 'prisma', 'dev.db')
    console.log('Looking for database at:', dbPath)
    console.log('Database exists:', existsSync(dbPath))

    const users = await prisma.user.findMany()
    const posts = await prisma.post.findMany()

    console.log('\nUsers in database:', users.length)
    console.log(JSON.stringify(users, null, 2))
    
    console.log('\nPosts in database:', posts.length)
    console.log(JSON.stringify(posts, null, 2))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 