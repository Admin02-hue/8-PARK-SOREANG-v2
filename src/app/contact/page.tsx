
/**
 * Contact Form Page
 * =================
 * Halaman untuk submit inquiry/lead
 */

import React, { Suspense } from 'react'
import ContactPageContent from './ContactPageContent'

export const metadata = {
  title: 'Hubungi Kami | 8 Park Soreang',
  description: 'Hubungi marketing kami untuk inquire tentang unit tersedia',
  openGraph: {
    title: 'Hubungi Kami | 8 Park Soreang',
    description: 'Hubungi marketing kami untuk inquire tentang unit tersedia',
  },
}

function ContactPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="h-12 bg-slate-700 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-slate-700 rounded w-full mb-8"></div>
          <div className="space-y-4">
            <div className="h-12 bg-slate-700 rounded"></div>
            <div className="h-12 bg-slate-700 rounded"></div>
            <div className="h-12 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={<ContactPageSkeleton />}>
      <ContactPageContent />
    </Suspense>
  )
}
