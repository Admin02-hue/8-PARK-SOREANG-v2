'use client'

import { Toaster } from 'react-hot-toast'
import { Navbar } from '@/components/navbar/Navbar'
import FloatingChatButton from '@/components/FloatingChatButton'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  return (
    <>
      {!isAdminPage && <Navbar />}
      {!isAdminPage && <FloatingChatButton />}
      <main className="pt-0">{children}</main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          },
          success: {
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            },
          },
          error: {
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            },
          },
        }}
      />
    </>
  )
}

