import { BlogPost } from '@/app/components/BlogPost'
import { prisma } from '@/lib/prisma'
import { Pagination } from '@/app/components/Pagination'
import Link from 'next/link'

export default async function Posts({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = Number(searchParams.page) || 1
  const pageSize = 6
  const skip = (page - 1) * pageSize

  try {
    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        include: { author: true },
        skip,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
      prisma.post.count(),
    ])

    const totalPages = Math.ceil(totalPosts / pageSize)

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">All Blog Posts</h1>
          <Link
            href="/posts/create"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Create New Post
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogPost 
              key={post.id} 
              post={post} 
              isEditable={true}
              showActions={false}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
          />
        )}
      </div>
    )
  } catch (error) {
    console.error('Error fetching posts:', error)
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-600">Failed to load posts. Please try again later.</p>
        </div>
      </div>
    )
  }
} 