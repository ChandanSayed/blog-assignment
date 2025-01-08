import { Post } from '@prisma/client'
import { config } from './config'

const baseUrl = config.baseUrl

export async function getPosts() {
  const res = await fetch(`${baseUrl}/api/posts`)
  return res.json()
}

export async function createPost(data: Partial<Post>) {
  const res = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updatePost(id: number, data: Partial<Post>) {
  const res = await fetch(`${baseUrl}/api/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deletePost(id: number) {
  await fetch(`${baseUrl}/api/posts/${id}`, {
    method: 'DELETE',
  })
} 