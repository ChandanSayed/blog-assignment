import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const posts = await prisma.post.findMany({
    include: { author: true },
  })
  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  const data = await request.json()
  const post = await prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      authorId: data.authorId,
    },
    include: { author: true },
  })
  return NextResponse.json(post)
} 