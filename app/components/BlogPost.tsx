'use client'

import { useUserStore } from '@/store/userStore'
import { useBlogStore } from '@/store/blogStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Author {
  id: number
  name: string
  email: string
}

interface Post {
  id: number
  title: string
  content: string
  authorId: number
  author: Author
}

interface BlogPostProps {
  post: Post
  isEditable: boolean
  showActions: boolean
}

export function BlogPost({ post, isEditable, showActions }: BlogPostProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useUserStore()
  const { dispatch } = useBlogStore()

  const isAuthor = isAuthenticated && user?.id === post.authorId

  const handleEdit = () => {
    router.push(`/posts/${post.id}/edit`)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch({ type: 'DELETE_POST', id: post.id })
    }
  }

  return (
    <div className="container mx-auto px-2 md:px-4">
      <Link href={`/posts/${post.id}`}>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{post.title}</h1>
      </Link>
      <p className="text-sm md:text-base">{post.content}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">By {post.author.name}</span>
        {showActions && isEditable && isAuthor && (
          <div className="space-x-2">
            <button
              onClick={handleEdit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              aria-label="edit"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              aria-label="delete"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 