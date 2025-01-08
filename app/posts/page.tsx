import { BlogPost } from '@/app/components/BlogPost'
import { NewPost } from '@/app/components/NewPost'
import { getPosts } from '@/lib/blog'
import { Post } from '@prisma/client'

export default async function Posts() {
  const posts = await getPosts()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">All Blog Posts</h1>
      <NewPost />
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: Post) => (
          <BlogPost key={post.id} post={post} isEditable={true} />
        ))}
      </div>
    </div>
  )
} 