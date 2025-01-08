import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json()
  const post = await prisma.post.update({
    where: { id: parseInt(params.id) },
    data: {
      title: data.title,
      content: data.content,
    },
    include: { author: true },
  })
  return NextResponse.json(post)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.post.delete({
    where: { id: parseInt(params.id) },
  })
  return NextResponse.json({ message: 'Post deleted' })
} 