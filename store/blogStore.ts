import { create } from 'zustand'
import { Post } from '@prisma/client'

interface BlogState {
  posts: Post[]
  dispatch: (action: BlogAction) => void
}

type BlogAction = 
  | { type: 'SET_POSTS'; posts: Post[] }
  | { type: 'ADD_POST'; post: Post }
  | { type: 'UPDATE_POST'; post: Post }
  | { type: 'DELETE_POST'; id: number }

export const useBlogStore = create<BlogState>((set) => ({
  posts: [],
  dispatch: (action) => {
    switch (action.type) {
      case 'SET_POSTS':
        set({ posts: action.posts })
        break
      case 'ADD_POST':
        set((state) => ({ posts: [action.post, ...state.posts] }))
        break
      case 'UPDATE_POST':
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === action.post.id ? action.post : post
          ),
        }))
        break
      case 'DELETE_POST':
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== action.id),
        }))
        break
    }
  },
})) 