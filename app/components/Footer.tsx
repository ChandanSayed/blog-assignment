'use client'

import Link from 'next/link'
import { useUserStore } from '@/store/userStore'
import { useLoadingStore } from '@/store/loadingStore'

export function Footer() {
  const { isAuthenticated, user } = useUserStore()
  const isHydrating = useLoadingStore((state) => state.isHydrating)
  const currentYear = new Date().getFullYear()

  // Don't render navigation items while hydrating
  if (isHydrating) {
    return (
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Static content only */}
            <div>
              <h3 className="text-lg font-semibold mb-4">About BlogApp</h3>
              <p className="text-gray-300">
                A platform for sharing thoughts, ideas, and stories with the world.
              </p>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About BlogApp</h3>
            <p className="text-gray-300">
              A platform for sharing thoughts, ideas, and stories with the world.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/posts" className="text-gray-300 hover:text-white">
                  All Posts
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">User</h3>
            <ul className="space-y-2">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link href="/posts/create" className="text-gray-300 hover:text-white">
                      Create Post
                    </Link>
                  </li>
                  <li>
                    <Link href={`/posts/user/${user?.id}`} className="text-gray-300 hover:text-white">
                      My Posts
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="text-gray-300 hover:text-white">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-gray-300 hover:text-white">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: contact@blogapp.com</li>
              <li>Twitter: @blogapp</li>
              <li>GitHub: github.com/blogapp</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {currentYear} BlogApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 