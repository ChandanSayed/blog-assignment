'use client'

import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { useBlogStore } from '@/store/blogStore'
import { createPost, updatePost, deletePost } from '@/lib/blog'
import Link from 'next/link'
import { Post } from '@prisma/client'

export function BlogPost({ post, isEditable = false }: { post: Post, isEditable?: boolean }) {
  const { user } = useUserStore()
  const { dispatch } = useBlogStore()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState<string>(post.content ?? '')

  const handleUpdate = async () => {
    const updatedPost = await updatePost(post.id, { title, content })
    dispatch({ type: 'UPDATE_POST', post: updatedPost })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    await deletePost(post.id)
    dispatch({ type: 'DELETE_POST', id:post.id })
  }

  if (isEditing) {
    return (
      <div className="border rounded-lg p-6 shadow-md">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mb-4 p-2 border rounded h-32"
        />
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
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
        <p className="text-sm text-gray-500">By {post.authorId}</p>
        {isEditable && user?.id === post.authorId && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-500 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 