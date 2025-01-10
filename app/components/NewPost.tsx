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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to create a post')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const post = await createPost({
        title,
        content,
        authorId: user.id,
        published: true,
      })
      
      dispatch({ type: 'ADD_POST', post })
      setTitle('')
      setContent('')
      // Optionally refresh the page to show the new post
      window.location.reload()
    } catch (err) {
      setError('Failed to create post. Please try again.')
      console.error('Create post error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <form 
      onSubmit={handleSubmit} 
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {error}
        </div>
      )}
      <div className="mb-4">
        <label htmlFor="title" className="sr-only">Title</label>
        <input 
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
          aria-required="true"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="content" className="sr-only">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content..."
          className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-blue-500"
          required
          aria-required="true"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  )
} 