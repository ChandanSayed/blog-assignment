'use client'

import { useRef } from 'react'
import { useUserStore } from '@/store/userStore'

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const initialized = useRef(false)
  if (!initialized.current) {
    initialized.current = true
    useUserStore.persist.rehydrate()
  }

  return <>{children}</>
} 