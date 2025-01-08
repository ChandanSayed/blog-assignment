import { prisma } from '../lib/prisma'

async function main() {
  try {
    // Delete all posts first due to foreign key constraints
    await prisma.post.deleteMany({})
    // Then delete all users
    await prisma.user.deleteMany({})
    
    console.log('All seed data has been deleted')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 