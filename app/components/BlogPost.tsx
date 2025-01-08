'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { useBlogStore } from '@/store/blogStore'
import { createPost, updatePost, deletePost } from '@/lib/blog'
import Link from 'next/link'
import { Post, User } from '@prisma/client'

interface BlogPostWithAuthor extends Post {
  author: User
}

interface BlogPostProps {
  post: BlogPostWithAuthor
  isEditable?: boolean
  showActions?: boolean
}

export function BlogPost({ 
  post, 
  isEditable = false,
  showActions = false 
}: BlogPostProps) {
  const router = useRouter()
  const { user } = useUserStore()
  const { dispatch } = useBlogStore()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content ?? '')
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    try {
      setIsLoading(true)
      const updatedPost = await updatePost(post.id, { title, content })
      dispatch({ type: 'UPDATE_POST', post: updatedPost })
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to update post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        setIsLoading(true)
        await deletePost(post.id)
        dispatch({ type: 'DELETE_POST', id: post.id })
        
        router.refresh()
      } catch (error) {
        console.error('Failed to delete post:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (isEditing) {
    return (
      <div className="border rounded-lg p-6 shadow-md">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          disabled={isLoading}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mb-4 p-2 border rounded h-32"
          disabled={isLoading}
        />
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            disabled={isLoading}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
      <p className="text-gray-600 mb-4">{post.content}</p>
      <div className="flex justify-between items-center">
        <Link 
          href={`/posts/user/${post.authorId}`}
          className="text-sm text-gray-500 hover:text-blue-500"
        >
          By {post.author.name}
        </Link>
        {showActions && isEditable && user?.id === post.authorId && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:opacity-50"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 