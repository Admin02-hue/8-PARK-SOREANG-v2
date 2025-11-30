/**
 * Dynamic Floating Chat Button
 * ============================
 * Lazy load floating chat button untuk mengurangi initial payload
 * Chat functionality tidak critical untuk first paint
 */

import dynamic from 'next/dynamic'

const FloatingChatButton = dynamic(
  () => import('./FloatingChatButton'),
  {
    loading: () => null, // Jangan tampilkan loading state untuk floating element
    ssr: false, // Chat memerlukan browser state dan Supabase client
  }
)

export function DynamicFloatingChat() {
  return <FloatingChatButton />
}
