'use client'

import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { useBlogStore } from '@/store/blogStore'
import { createPost } from '@/lib/blog'

export function NewPost() {
  const { user } = useUserStore()
  const { dispatch } = useBlogStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const post = await createPost({
      title,
      content,
      authorId: user.id,
    })
    
    dispatch({ type: 'ADD_POST', post })
    setTitle('')
    setContent('')
  }

  if (!user) return null

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content..."
          className="w-full p-2 border rounded h-32"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Create Post
      </button>
    </form>
  )
} 