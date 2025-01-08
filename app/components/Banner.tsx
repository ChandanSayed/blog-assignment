'use client'

export function Banner() {
  return (
    <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 h-[400px] flex items-center justify-center text-white">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Our Blog</h1>
        <p className="text-xl">Discover stories, thinking, and expertise</p>
      </div>
    </div>
  )
} 