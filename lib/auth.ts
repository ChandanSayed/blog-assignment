import { PrismaClient, User } from '@prisma/client'
import { hash, compare } from 'bcryptjs'

const prisma = new PrismaClient()

export async function register(email: string, password: string, name: string) {
  const hashedPassword = await hash(password, 10)
  
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    return { user: userWithoutPassword }
  } catch (error) {
    throw new Error('Registration failed')
  }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) throw new Error('User not found')

  const isValid = await compare(password, user.password)
  if (!isValid) throw new Error('Invalid password')

  const { password: _, ...userWithoutPassword } = user
  return { user: userWithoutPassword }
} 