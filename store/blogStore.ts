import { create } from 'zustand'
import { Post } from '@prisma/client'

type BlogAction = 
  | { type: 'ADD_POST'; post: Post }
  | { type: 'UPDATE_POST'; post: Post }
  | { type: 'DELETE_POST'; id: number }
  | { type: 'SET_POSTS'; posts: Post[] }

interface BlogState {
  posts: Post[]
  dispatch: (action: BlogAction) => void
}

const blogReducer = (state: Post[], action: BlogAction): Post[] => {
  switch (action.type) {
    case 'ADD_POST':
      return [...state, action.post]
    case 'UPDATE_POST':
      return state.map(post => 
        post.id === action.post.id ? action.post : post
      )
    case 'DELETE_POST':
      return state.filter(post => post.id !== action.id)
    case 'SET_POSTS':
      return action.posts
    default:
      return state
  }
}

export const useBlogStore = create<BlogState>((set) => ({
  posts: [],
  dispatch: (action) => 
    set((state) => ({ posts: blogReducer(state.posts, action) })),
})) 