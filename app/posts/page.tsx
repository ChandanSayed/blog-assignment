import { BlogPost } from '@/app/components/BlogPost'
import { NewPost } from '@/app/components/NewPost'
import { prisma } from '@/lib/prisma'
import { Pagination } from '../components/Pagination'

export default async function Posts({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = Number(searchParams.page) || 1
  const pageSize = 6
  const skip = (page - 1) * pageSize

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
      <h1 className="text-4xl font-bold mb-8">All Blog Posts</h1>
      <NewPost />
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogPost key={post.id} post={post} isEditable={true} />
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
} 