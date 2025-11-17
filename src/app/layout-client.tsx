'use client'

import { Toaster } from 'react-hot-toast'
import { Navbar } from '@/components/navbar/Navbar'
import React from 'react'

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="pt-0">{children}</main>
      <Toaster position="bottom-right" />
    </>
  )
}
