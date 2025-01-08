'use client'

import { useRef, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { useLoadingStore } from '@/store/loadingStore'

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const initialized = useRef(false)
  const setIsHydrating = useLoadingStore((state) => state.setIsHydrating)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      useUserStore.persist.rehydrate()
      setIsHydrating(false)
    }
  }, [setIsHydrating])

  return <>{children}</>
} 