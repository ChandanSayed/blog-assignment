'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/store/userStore'
import { useLoadingStore } from '@/store/loadingStore'

export function Header() {
  const { user, isAuthenticated, logout } = useUserStore()
  const isHydrating = useLoadingStore((state) => state.isHydrating)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Don't render anything while hydrating to prevent flash
  if (isHydrating) {
    return <div className="h-16 bg-white shadow-md" /> // Placeholder height
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    // Prevent body scroll when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto'
  }

  return (
    <header className="bg-white shadow-md relative z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-800">
            BlogApp
          </Link>

          {/* Burger Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/posts" className="text-gray-600 hover:text-gray-900">
              All Posts
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/posts/create"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Create Post
                </Link>
                <Link
                  href={`/posts/user/${user?.id}`}
                  className="text-gray-600 hover:text-gray-900"
                >
                  My Posts
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600">
                  Welcome, {user?.name || 'User'}
                </span>
                <button
                  onClick={() => logout()}
                  className="text-red-500 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden" 
            onClick={toggleMenu}
          />
        )}

        {/* Mobile Navigation Menu */}
        <div
          className={`${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white transform transition-transform duration-300 ease-in-out md:hidden z-50`}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Menu</span>
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-3 p-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 px-2 py-1"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              href="/posts"
              className="text-gray-600 hover:text-gray-900 px-2 py-1"
              onClick={toggleMenu}
            >
              All Posts
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/posts/create"
                  className="text-gray-600 hover:text-gray-900 px-2 py-1"
                  onClick={toggleMenu}
                >
                  Create Post
                </Link>
                <Link
                  href={`/posts/user/${user?.id}`}
                  className="text-gray-600 hover:text-gray-900 px-2 py-1"
                  onClick={toggleMenu}
                >
                  My Posts
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <>
                <span className="text-gray-600 px-2 py-1">
                  Welcome, {user?.name || 'User'}
                </span>
                <button
                  onClick={() => {
                    logout()
                    toggleMenu()
                  }}
                  className="text-red-500 hover:text-red-700 text-left px-2 py-1"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 px-2 py-1"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-gray-600 hover:text-gray-900 px-2 py-1"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
} 