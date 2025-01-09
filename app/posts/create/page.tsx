'use client'

import { useEffect } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { createPost } from '@/lib/blog'

export default function CreatePost() {
  const router = useRouter()
  const { user, isAuthenticated } = useUserStore()
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })
  const [formErrors, setFormErrors] = useState({
    title: '',
    content: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  const validateForm = () => {
    let isValid = true
    const errors = {
      title: '',
      content: ''
    }

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
      isValid = false
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters long'
      isValid = false
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required'
      isValid = false
    } else if (formData.content.length < 10) {
      errors.content = 'Content must be at least 10 characters long'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    setFormErrors(prev => ({
      ...prev,
      [name]: ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to create a post')
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await createPost({
        title: formData.title,
        content: formData.content,
        authorId: user.id,
        published: true,
      })
      
      router.push('/posts')
      router.refresh()
    } catch (err) {
      setError('Failed to create post. Please try again.')
      console.error('Create post error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const isFormValid = formData.title.trim().length >= 3 && formData.content.trim().length >= 10

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
            {formErrors.title && (
              <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full p-2 border rounded h-64 focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
            {formErrors.content && (
              <p className="mt-1 text-sm text-red-600">{formErrors.content}</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Post'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}