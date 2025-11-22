'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, X, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { ChatService } from '@/lib/ChatService'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'
import { motion, AnimatePresence } from 'framer-motion'
import { QuickReplyCards } from '@/components/QuickReplyCards'

// Helper function untuk generate visitor number dari guest_id
const getVisitorNumber = (guestId: string): number => {
  let hash = 0
  for (let i = 0; i < guestId.length; i++) {
    const char = guestId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash) % 10000 + 1 // Nomor 1-10000
}

// Helper: Format waktu ke WIB (UTC+7)
const formatTimeWIB = (dateString: string): string => {
  const date = new Date(dateString)
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return formatter.format(date)
}

// Helper: Format tanggal lengkap dengan bulan, tahun, dan waktu Indonesia
const formatFullDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  
  const dayName = days[date.getDay()]
  const day = date.getDate()
  const monthName = months[date.getMonth()]
  const year = date.getFullYear()
  
  const timeFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const time = timeFormatter.format(date)
  
  return `${dayName}, ${day} ${monthName} ${year} ${time} WIB`
}

interface Message {
  id: string
  room_id: string
  message: string
  sender: 'guest' | 'admin'
  pending: boolean
  is_read: boolean
  created_at: string
}

interface ConversationUI {
  id: string
  guest_id: string
  is_closed: boolean
  assigned_admin: string | null
  created_at: string
  updated_at: string
  unread: number
  messages: Message[]
  isTyping?: boolean
}

export default function LiveChatPanel() {
  const supabase = createClientComponentClient<Database>()

  // State
  const [conversations, setConversations] = useState<ConversationUI[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationUI | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingChats, setLoadingChats] = useState(true)
  const [adminId] = useState(() => localStorage.getItem('admin_id') || `admin-${Date.now()}`)
  const [adminOnline, setAdminOnline] = useState(true)
  const [guestTyping, setGuestTyping] = useState<{ [key: string]: boolean }>({})

  // Refs
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // === PLAY NOTIFICATION SOUND ===
  const playNotificationSound = useCallback(() => {
    try {
      console.log('[LiveChat] 🔊 Playing notification sound...')
      
      // Try with Web Audio API first (no file dependency)
      if (typeof window !== 'undefined' && window.AudioContext) {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const now = audioContext.currentTime
          
          // Create simple beep sound with oscillator
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          // Beep: 800Hz for 200ms
          oscillator.frequency.value = 800
          gainNode.gain.setValueAtTime(0.3, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
          
          oscillator.start(now)
          oscillator.stop(now + 0.2)
          
          console.log('[LiveChat] ✓ Sound played with Web Audio API 🎵')
          return
        } catch (webAudioErr) {
          console.log('[LiveChat] Web Audio API failed, trying HTML5 Audio...')
        }
      }
      
      // Fallback to HTML5 Audio element with file
      const audioUrl = new URL('/notify.mp3', window.location.origin).href
      const audio = new Audio()
      
      audio.oncanplay = () => {
        audio.play().catch(err => {
          console.warn('[LiveChat] Audio play failed (expected if file missing):', err.message)
        })
      }
      
      audio.onerror = () => {
        console.warn('[LiveChat] Audio file not found or invalid format - using Web Audio API fallback')
        // Web Audio API already tried above
      }
      
      audio.src = audioUrl
      audio.volume = 0.8
      audio.preload = 'auto'
      
      // Try to play immediately
      audio.play().catch(err => {
        console.warn('[LiveChat] Could not play audio:', err.message)
      })
      
    } catch (error) {
      console.warn('[LiveChat] Notification sound error:', error instanceof Error ? error.message : 'Unknown')
    }
  }, [])

  // === LOAD INITIAL ROOMS ===
  useEffect(() => {
    const loadChatRooms = async () => {
      try {
        setLoadingChats(true)
        const rooms = await ChatService.getAllRooms()

        const conversationsWithMessages = await Promise.all(
          rooms.map(async (room: any) => {
            const messages = await ChatService.getMessages(room.id)
            const unreadCount = messages.filter(
              (msg: any) => msg.sender === 'guest' && !msg.is_read
            ).length

            return {
              id: room.id,
              guest_id: room.guest_id,
              is_closed: room.is_closed,
              assigned_admin: room.assigned_admin,
              created_at: room.created_at,
              updated_at: room.updated_at,
              unread: unreadCount,
              messages,
            } as ConversationUI
          })
        )

        setConversations(
          conversationsWithMessages.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
        )

        if (conversationsWithMessages.length > 0) {
          setSelectedConversation(conversationsWithMessages[0])
        }
      } catch (error) {
        console.error('[LiveChat] Error loading rooms:', error)
        toast.error('Gagal memuat chat rooms')
      } finally {
        setLoadingChats(false)
      }
    }

    loadChatRooms()
  }, [])

  // === SETUP ADMIN PRESENCE / HEARTBEAT ===
  useEffect(() => {
    // Set admin online saat component mount
    console.log('[LiveChat] Setting admin online on mount...')
    ChatService.setAdminOnline(adminId)

    // Setup heartbeat untuk update presence setiap 30 detik
    const heartbeatInterval = setInterval(() => {
      console.log('[LiveChat] Heartbeat - keeping admin online...')
      ChatService.setAdminOnline(adminId)
    }, 30 * 1000) // 30 seconds

    presenceIntervalRef.current = heartbeatInterval

    // Handle page unload/close - set admin offline
    const handleBeforeUnload = () => {
      console.log('[LiveChat] Page unloading, setting admin offline...')
      ChatService.setAdminOffline(adminId)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      // Cleanup
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current)
      }
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Set offline when component unmounts
      ChatService.setAdminOffline(adminId)
    }
  }, [adminId])

  // === LISTENER: CHECK ADMIN ONLINE STATUS ===
  useEffect(() => {
    const checkAdminStatus = async () => {
      const isOnline = await ChatService.isSpecificAdminOnline(adminId)
      setAdminOnline(isOnline)
      console.log('[LiveChat] Admin online status:', isOnline)
    }

    // Check immediately
    checkAdminStatus()

    // Check setiap 10 detik untuk update status display
    const checkInterval = setInterval(() => {
      checkAdminStatus()
    }, 10 * 1000) // 10 seconds

    return () => {
      clearInterval(checkInterval)
    }
  }, [adminId])

  // === ADMIN AUTO-ASSIGN ROOM ===
  useEffect(() => {
    // Otomatis assign room ke admin yang membuka panel
    if (selectedConversation && !selectedConversation.assigned_admin) {
      ChatService.assignAdmin(selectedConversation.id, adminId)
    }
  }, [selectedConversation, adminId])

  // === LISTENER: NEW ROOMS & ROOM UPDATES ===
  useEffect(() => {
    console.log('[LiveChat] Setting up room listener...')
    const channel = supabase
      .channel('chat-rooms-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_rooms',
        },
        (payload: any) => {
          console.log('[LiveChat] New room created:', payload.new)
          const newConv: ConversationUI = {
            id: payload.new.id,
            guest_id: payload.new.guest_id,
            is_closed: payload.new.is_closed,
            assigned_admin: payload.new.assigned_admin,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at,
            unread: 1,
            messages: [],
          }

          setConversations((prev) => [newConv, ...prev])
          toast.success(`🔔 Percakapan baru dari ${payload.new.guest_id}`)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_rooms',
        },
        (payload: any) => {
          console.log('[LiveChat] Room updated:', payload.new.id)
          // Update conversations list dengan room info terbaru
          setConversations((prev) => {
            return prev
              .map((conv) => {
                if (conv.id === payload.new.id) {
                  return {
                    ...conv,
                    is_closed: payload.new.is_closed,
                    assigned_admin: payload.new.assigned_admin,
                    updated_at: payload.new.updated_at,
                  }
                }
                return conv
              })
              .sort(
                (a, b) =>
                  new Date(b.updated_at).getTime() -
                  new Date(a.updated_at).getTime()
              )
          })
        }
      )
      .subscribe((status) => {
        console.log('[LiveChat] Room channel subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // === LISTENER: ALL MESSAGES (untuk update conversations list) ===
  useEffect(() => {
    console.log('[LiveChat] Setting up global message listener...')
    const channel = supabase
      .channel('all-chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload: any) => {
          console.log('[LiveChat] Message received globally:', payload.new)

          // Update conversations list
          setConversations((prev) =>
            prev
              .map((conv) => {
                if (conv.id === payload.new.room_id) {
                  // Check duplicate
                  const isDuplicate = conv.messages.some(
                    (msg) => msg.id === payload.new.id
                  )
                  if (isDuplicate) {
                    console.log('[LiveChat] Duplicate detected in global listener, skipping')
                    return conv
                  }

                  const unreadCount =
                    payload.new.sender === 'guest' && !payload.new.is_read ? 1 : 0
                  console.log('[LiveChat] Adding message to conversations list:', payload.new.id)
                  return {
                    ...conv,
                    messages: [...conv.messages, payload.new],
                    unread: conv.unread + unreadCount,
                    updated_at: new Date().toISOString(),
                  }
                }
                return conv
              })
              .sort(
                (a, b) =>
                  new Date(b.updated_at).getTime() -
                  new Date(a.updated_at).getTime()
              )
          )

          // ALSO update selected conversation jika ini adalah roomnya
          setSelectedConversation((prev) => {
            if (!prev || prev.id !== payload.new.room_id) return prev
            const isDuplicate = prev.messages.some((msg) => msg.id === payload.new.id)
            if (isDuplicate) return prev
            console.log('[LiveChat] Adding message to selected conversation (global listener):', payload.new.id)
            return {
              ...prev,
              messages: [...prev.messages, payload.new],
            }
          })
        }
      )
      .subscribe((status) => {
        console.log('[LiveChat] Global message channel status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // === LISTENER: MESSAGES IN SELECTED ROOM ===
  useEffect(() => {
    if (!selectedConversation?.id) return

    const roomId = selectedConversation.id
    console.log('[LiveChat] Subscribing to messages in room:', roomId)

    const channel = supabase
      .channel(`messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: any) => {
          console.log('[LiveChat] Message event in selected room:', payload.eventType, payload.new)

          if (payload.eventType === 'INSERT') {
            console.log('[LiveChat] INSERT detected - checking message...')
            
            // Play notification sound for incoming messages from guest
            if (payload.new.sender === 'guest') {
              console.log('[LiveChat] 🔔 Incoming message from guest, playing notification...')
              playNotificationSound()
            }

            // New message - update selected conversation FIRST
            setSelectedConversation((prev) => {
              if (!prev || prev.id !== roomId) {
                console.log('[LiveChat] Selected conversation mismatch or null, skipping')
                return prev
              }
              const isDuplicate = prev.messages.some((msg) => msg.id === payload.new.id)
              console.log('[LiveChat] Duplicate check for selected:', isDuplicate, 'Message ID:', payload.new.id)
              if (isDuplicate) return prev // Prevent duplicate
              
              console.log('[LiveChat] Adding new message to selected conversation')
              return {
                ...prev,
                messages: [...prev.messages, payload.new],
                unread: prev.unread + (payload.new.sender === 'guest' && !payload.new.is_read ? 1 : 0),
              }
            })

            // Update conversations list juga
            setConversations((prev) =>
              prev
                .map((conv) => {
                  if (conv.id === roomId) {
                    const isDuplicate = conv.messages.some(
                      (msg) => msg.id === payload.new.id
                    )
                    if (isDuplicate) {
                      console.log('[LiveChat] Duplicate in conversations list, skipping')
                      return conv // Prevent duplicate
                    }
                    console.log('[LiveChat] Adding new message to conversations list')
                    const unreadCount =
                      payload.new.sender === 'guest' && !payload.new.is_read ? 1 : 0
                    return {
                      ...conv,
                      messages: [...conv.messages, payload.new],
                      unread: conv.unread + unreadCount,
                      updated_at: new Date().toISOString(),
                    }
                  }
                  return conv
                })
                .sort(
                  (a, b) =>
                    new Date(b.updated_at).getTime() -
                    new Date(a.updated_at).getTime()
                )
            )

            // Auto-mark as read if message from guest
            if (payload.new.sender === 'guest') {
              console.log('[LiveChat] Marking message as read...')
              ChatService.markRead(roomId, 'admin')
            }
          }

          if (payload.eventType === 'UPDATE') {
            console.log('[LiveChat] UPDATE detected')
            // Message update (pending, read, dll)
            setSelectedConversation((prev) => {
              if (!prev || prev.id !== roomId) return prev
              return {
                ...prev,
                messages: prev.messages.map((msg) =>
                  msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
                ),
              }
            })

            // Also update in conversations list
            setConversations((prev) =>
              prev.map((conv) => {
                if (conv.id === roomId) {
                  return {
                    ...conv,
                    messages: conv.messages.map((msg) =>
                      msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
                    ),
                  }
                }
                return conv
              })
            )
          }
        }
      )
      .subscribe((status) => {
        console.log('[LiveChat] Selected room channel subscription status:', status)
      })

    return () => {
      console.log('[LiveChat] Unsubscribing from room:', roomId)
      supabase.removeChannel(channel)
    }
  }, [selectedConversation?.id, supabase, playNotificationSound])

  // === LISTENER: TYPING STATUS GUEST ===
  useEffect(() => {
    if (!selectedConversation) return

    const channel = supabase
      .channel(`typing-${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing',
          filter: `room_id=eq.${selectedConversation.id}`,
        },
        (payload: any) => {
          if (payload.new.sender === 'guest') {
            console.log('[LiveChat] Guest typing:', payload.new.typing)
            setGuestTyping((prev) => ({
              ...prev,
              [selectedConversation.id]: payload.new.typing,
            }))

            // Auto-off after 3 seconds
            if (typingTimeoutRef.current[selectedConversation.id]) {
              clearTimeout(typingTimeoutRef.current[selectedConversation.id])
            }

            if (payload.new.typing) {
              typingTimeoutRef.current[selectedConversation.id] = setTimeout(() => {
                setGuestTyping((prev) => ({
                  ...prev,
                  [selectedConversation.id]: false,
                }))
              }, 3000)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation?.id])

  // === AUTO SCROLL WHEN NEW MESSAGES ARRIVE ===
  useEffect(() => {
    // Scroll ke message terbaru saat ada pesan baru
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedConversation?.messages.length])

  // === SEND MESSAGE ===
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setLoading(true)
      const messageText = newMessage.trim()
      console.log('[LiveChat] Sending admin message to room:', selectedConversation.id)

      // Optimistic update - tambahkan pesan langsung ke UI dengan pending: false (delivered)
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        room_id: selectedConversation.id,
        message: messageText,
        sender: 'admin',
        pending: false,
        is_read: false,
        created_at: new Date().toISOString(),
      }

      setSelectedConversation((prev) => {
        if (!prev) return null
        return {
          ...prev,
          messages: [...prev.messages, optimisticMessage],
        }
      })

      setNewMessage('')

      const { data, error } = await ChatService.sendMessage(
        selectedConversation.id,
        messageText,
        'admin'
      )

      if (error) {
        console.error('[LiveChat] Send error:', error)
        // Rollback optimistic update
        setSelectedConversation((prev) => {
          if (!prev) return null
          return {
            ...prev,
            messages: prev.messages.filter((msg) => msg.id !== optimisticMessage.id),
          }
        })
        toast.error('Gagal mengirim pesan')
        return
      }

      toast.success('Pesan terkirim')

      // Replace temp message dengan actual message dari DB (sudah delivered, pending: false)
      if (data?.id) {
        setSelectedConversation((prev) => {
          if (!prev) return null
          return {
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.id === optimisticMessage.id ? { ...data, pending: false } : msg
            ),
          }
        })

        // Update conversations list
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === selectedConversation.id) {
              return {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === optimisticMessage.id ? { ...data, pending: false } : msg
                ),
                updated_at: new Date().toISOString(),
              }
            }
            return conv
          })
        )
      }
    } catch (error) {
      console.error('[LiveChat] Send exception:', error)
      toast.error('Gagal mengirim pesan')
    } finally {
      setLoading(false)
    }
  }

  // === CLOSE ROOM ===
  const handleCloseRoom = async () => {
    if (!selectedConversation) return

    try {
      console.log('[LiveChat] Closing room:', selectedConversation.id)
      await ChatService.closeRoom(selectedConversation.id)

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? { ...conv, is_closed: true }
            : conv
        )
      )

      setSelectedConversation(null)
      toast.success('Room ditutup')
    } catch (error) {
      console.error('[LiveChat] Close error:', error)
      toast.error('Gagal menutup room')
    }
  }

  // === RENDER ===
  if (loadingChats) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(30px)',
        }}
      >
        <div className="text-white text-center">
          <MessageSquare className="w-12 h-12 mb-4 mx-auto animate-pulse" />
          <p>Memuat percakapan...</p>
        </div>
      </div>
    )
  }

  if (!selectedConversation) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(30px)',
        }}
      >
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mb-4 mx-auto text-white/50" />
          <p className="text-white text-lg">Tidak ada percakapan yang dipilih</p>
          {conversations.length === 0 && (
            <p className="text-white/70 mt-2">Tunggu percakapan dari pengunjung...</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-screen flex"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(30px)',
      }}
    >
      {/* Conversations List */}
      <div
        className="w-80 border-r flex flex-col overflow-hidden"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div
          className="p-6"
          style={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h2 className="text-2xl font-bold text-white">Live Chat</h2>
          <p className="text-sm text-white/80">
            {adminOnline ? '🟢 Online' : '🔴 Offline'} • {conversations.length} room
          </p>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto space-y-2 p-4">
          {conversations.map((conv) => (
            <motion.button
              key={conv.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setSelectedConversation(conv)
                // Mark as read when selecting
                if (conv.unread > 0) {
                  ChatService.markRead(conv.id, 'admin')
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === conv.id ? { ...c, unread: 0 } : c
                    )
                  )
                }
              }}
              className="w-full p-4 rounded-lg transition-all duration-200 text-left relative"
              style={
                selectedConversation.id === conv.id
                  ? {
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(15px)',
                    }
                  : {
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(15px)',
                    }
              }
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-white">Visitor {getVisitorNumber(conv.guest_id)}</p>
                  <p className="text-xs text-white/70" title={formatFullDateTime(conv.updated_at)}>
                    {formatTimeWIB(conv.updated_at)}
                  </p>
                </div>
                <div className="flex gap-1 items-center">
                  {conv.unread > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                      {conv.unread}
                    </span>
                  )}
                  {conv.is_closed && (
                    <span className="ml-2 px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
                      Tutup
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-white/80 truncate">
                {conv.messages[conv.messages.length - 1]?.message || '(Mulai percakapan)'}
              </p>
            </motion.button>
          ))}

          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-8 h-8 mb-2 text-white/50" />
              <p className="text-white/70">Belum ada percakapan</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className="flex-1 flex flex-col"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(25px)',
        }}
      >
        {/* Chat Header */}
        <div
          className="p-6"
          style={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                Visitor {getVisitorNumber(selectedConversation.guest_id)}
              </h3>
              <p className="text-sm text-white/70">
                {!selectedConversation.is_closed ? '🟢 Aktif' : '⚫ Ditutup'} •{' '}
                {selectedConversation.messages.length} pesan
              </p>
            </div>
            <div className="flex gap-2">
              {!selectedConversation.is_closed && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseRoom}
                  className="p-2 hover:bg-red-500/30 rounded-lg transition text-white/70 hover:text-white"
                  title="Tutup percakapan"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-4"
          style={{
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(15px)',
          }}
        >
          {selectedConversation.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-12 h-12 mb-2 text-white/30" />
              <p className="text-white/70">Mulai percakapan dengan tamu</p>
            </div>
          ) : (
            selectedConversation.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.pending ? 'opacity-60' : 'opacity-100'
                  }`}
                  style={
                    msg.sender === 'admin'
                      ? {
                          background: 'rgba(59, 130, 246, 0.25)',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          backdropFilter: 'blur(10px)',
                          color: '#ffffff',
                        }
                      : {
                          background: 'rgba(255, 255, 255, 0.12)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          color: '#ffffff',
                        }
                  }
                >
                  <p className="text-sm">{msg.message}</p>
                  <div className="text-xs mt-1 flex items-center justify-between gap-1" style={{ opacity: 0.7 }}>
                    <span title={formatFullDateTime(msg.created_at)}>
                      {formatTimeWIB(msg.created_at)}
                    </span>
                    {msg.sender === 'admin' && (
                      <span>
                        {msg.pending ? (
                          <span>• pending</span>
                        ) : msg.is_read ? (
                          <span>✔✔</span>
                        ) : (
                          <span>✔</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {/* Guest Typing Indicator */}
          {guestTyping[selectedConversation.id] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div
                className="px-4 py-3 rounded-lg rounded-bl-none text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: '#ffffff',
                }}
              >
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!selectedConversation.is_closed ? (
          <div
            className="p-6 space-y-4"
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Quick Reply Cards */}
            <QuickReplyCards
              onSelectMessage={(message) => {
                setNewMessage(message)
              }}
              isLoading={loading}
            />

            {/* Input Field */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Tulis pesan..."
                className="flex-1 px-4 py-3 rounded-lg text-white placeholder-white/50 focus:outline-none transition"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                }}
                disabled={loading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={loading || !newMessage.trim()}
                className="px-6 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition font-medium flex items-center gap-2"
                style={{
                  background: 'rgba(59, 130, 246, 0.4)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Send className="w-4 h-4" />
                Kirim
              </motion.button>
            </div>
          </div>
        ) : (
          <div
            className="p-6"
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <p className="text-center text-white/70">Chat room sudah ditutup</p>
          </div>
        )}
      </div>
    </div>
  )
}
