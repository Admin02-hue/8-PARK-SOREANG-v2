'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatService } from '@/lib/ChatService'
import { getBrowserSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

// Logging - disabled for clean production console
const log = (...args: any[]) => {}  // Info logs disabled
const logError = (...args: any[]) => {}  // Error logs disabled

interface Message {
  id: string
  room_id: string
  message: string
  sender: 'guest' | 'admin'
  pending: boolean
  is_read: boolean
  created_at: string
}

// Helper: Get supabase client
function getClient(): any {
  return getBrowserSupabaseClient()
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

export default function FloatingChatButton() {
  // State
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [guestId, setGuestId] = useState<string | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [adminOnline, setAdminOnline] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messageChannelRef = useRef<any>(null)
  const typingChannelRef = useRef<any>(null)
  const presenceChannelRef = useRef<any>(null)

  // === SCROLL TO BOTTOM ===
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // === GENERATE/GET GUEST ID ===
  useEffect(() => {
    let id = localStorage.getItem('guest_id_chat')
    const isValidUUID = id && /^[0-9a-fA-F-]{36}$/.test(id)

    if (!isValidUUID) {
      id = crypto.randomUUID()
      localStorage.setItem('guest_id_chat', id)
    }

    setGuestId(id)
  }, [])

  // === INITIALIZE CHAT ROOM ===
  useEffect(() => {
    if (!guestId) return

    const initializeChat = async () => {
      try {
        log('[FloatingChat] Initializing room for guest:', guestId)
        const room = await ChatService.getRoom(guestId)
        if (room) {
          const roomId = room.id || room.room_id
          setRoomId(roomId)
          log('[FloatingChat] Room initialized:', roomId)

          // Immediately load existing messages when room is initialized
          try {
            const msgs = await ChatService.getMessages(roomId)
            log('[FloatingChat] Pre-loaded messages:', msgs.length)
            setMessages(msgs)
          } catch (err) {
            logError('[FloatingChat] Error pre-loading messages:', err)
          }
        }
      } catch (error) {
        logError('[FloatingChat] Error initializing chat:', error)
      }
    }

    initializeChat()
  }, [guestId])

  // === LISTENER: REAL-TIME MESSAGES ===
  useEffect(() => {
    if (!roomId) return

    log('[FloatingChat] Setting up message listener for room:', roomId)
    let isSubscribed = true

    // First, fetch all existing messages
    const loadMessages = async () => {
      try {
        const msgs = await ChatService.getMessages(roomId)
        if (isSubscribed) {
          log('[FloatingChat] Loaded messages:', msgs.length)
          setMessages(msgs)
        }
      } catch (err) {
        logError('[FloatingChat] Error loading messages:', err)
      }
    }

    loadMessages()

    // Then setup realtime listener - don't restart when isOpen changes!
    const channel = getClient()
      .channel(`messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: any) => {
          if (!isSubscribed) return

          log('[FloatingChat] Message event:', payload.eventType, payload.new)

          if (payload.eventType === 'INSERT') {
            // New message received
            setMessages((prev) => {
              // Check if message sudah ada (avoid duplicate)
              if (prev.some((m) => m.id === payload.new.id)) {
                log('[FloatingChat] Skipping duplicate message:', payload.new.id)
                return prev
              }
              log('[FloatingChat] Adding new message to UI:', payload.new.id)
              return [...prev, payload.new]
            })

            // Increment unread if from admin
            if (payload.new.sender === 'admin') {
              setUnreadCount((prev) => prev + 1)
            }
          }

          if (payload.eventType === 'UPDATE') {
            // Message update (e.g., pending -> delivered, or read status)
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
              )
            )
          }
        }
      )
      .subscribe((status: any) => {
        log('[FloatingChat] Channel subscription status:', status)
      })

    messageChannelRef.current = channel

    return () => {
      isSubscribed = false
      getClient().removeChannel(channel)
    }
  }, [roomId])

  // === MARK AS READ WHEN CHAT OPENS & REFRESH MESSAGES ===
  useEffect(() => {
    if (isOpen && roomId) {
      log('[FloatingChat] Chat opened, marking messages as read and refreshing...')
      ChatService.markRead(roomId, 'guest')
      setUnreadCount(0)

      // Refresh messages saat chat dibuka untuk ensure messages up-to-date
      ChatService.getMessages(roomId)
        .then((msgs: Message[]) => {
          log('[FloatingChat] Refreshed messages on open:', msgs.length)
          setMessages(msgs)
        })
        .catch((err) => logError('[FloatingChat] Error refreshing messages:', err))
    }
  }, [isOpen, roomId])

  // === LISTENER: TYPING INDICATOR ===
  useEffect(() => {
    if (!roomId) return

    log('[FloatingChat] Setting up typing listener for room:', roomId)

    const channel = getClient()
      .channel(`typing-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: any) => {
          // Jika admin yang ngetik
          if (payload.new.sender === 'admin') {
            setIsTyping(payload.new.typing)
            log('[FloatingChat] Admin typing:', payload.new.typing)
          }
        }
      )
      .subscribe((status: any) => {
        log('[FloatingChat] Typing channel subscription status:', status)
      })

    typingChannelRef.current = channel

    return () => {
      getClient().removeChannel(channel)
    }
  }, [roomId])

  // === LISTENER: ADMIN ONLINE STATUS ===
  useEffect(() => {
    let checkInterval: NodeJS.Timeout
    let lastCheckTime = 0
    const CHECK_THROTTLE_MS = 30000 // Check every 30 seconds instead of 3

    const checkAdminStatus = async () => {
      try {
        const isOnline = await ChatService.isAdminOnline()
        setAdminOnline(isOnline || false)
      } catch (error) {
        logError('[FloatingChat] Error checking admin status:', error)
        setAdminOnline(false)
      }
    }

    // Check immediately
    checkAdminStatus()

    // Check setiap 30 detik untuk realtime status (reduced frequency to prevent console spam)
    checkInterval = setInterval(checkAdminStatus, CHECK_THROTTLE_MS)

    return () => {
      if (checkInterval) clearInterval(checkInterval)
    }
  }, [])

  // === LISTENER: PUSH NOTIFICATION (WHEN TAB HIDDEN) ===
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isHidden = document.hidden
      log('[FloatingChat] Tab visibility:', isHidden ? 'HIDDEN' : 'VISIBLE')

      // Jika ada message baru dan tab tersembunyi (guest ga liat)
      if (isHidden && messages.length > 0) {
        const lastMsg = messages[messages.length - 1]
        if (lastMsg.sender === 'admin' && !lastMsg.is_read) {
          log('[FloatingChat] Playing notification sound...')
          // Play sound notification
          try {
            const audioUrl = new URL('/notify.mp3', window.location.origin).href
            const audio = new Audio(audioUrl)
            audio.volume = 0.5
            audio.play().catch((err) => log('[FloatingChat] Audio play failed:', err))
          } catch (error) {
            logError('[FloatingChat] Notification error:', error)
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [messages])

  // === SEND MESSAGE ===
  const sendMessage = async () => {
    if (!input.trim() || !roomId || loading) {
      return
    }

    const messageText = input.trim()
    const tempMessageId = `temp-${Date.now()}`
    setLoading(true)

    try {
      log('[FloatingChat] Sending message to room:', roomId)

      // Optimistic update - tambahkan pesan langsung ke UI dengan pending: false (delivered)
      const optimisticMessage: Message = {
        id: tempMessageId,
        room_id: roomId,
        message: messageText,
        sender: 'guest',
        pending: false,
        is_read: false,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, optimisticMessage])
      setInput('')

      const { data, error } = await ChatService.sendMessage(
        roomId,
        messageText,
        'guest'
      )

      if (error) {
        logError('[FloatingChat] Message send error:', error)
        // Rollback optimistic update
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId))
        const errorMsg = typeof error === 'string' ? error : JSON.stringify(error)
        alert('Error mengirim pesan: ' + errorMsg)
      } else {
        log('[FloatingChat] Message sent successfully:', data?.id)

        // Replace temp message dengan actual message dari DB (sudah delivered, pending: false)
        if (data?.id) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempMessageId ? { ...data, pending: false } : msg
            )
          )
        }
      }
    } catch (error) {
      // Rollback on exception
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== tempMessageId)
      )
      const errorMsg = error instanceof Error ? error.message : String(error)
      logError('[FloatingChat] Error sending message:', errorMsg)
      alert('Gagal mengirim pesan: ' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // === HANDLE TYPING ===
  const handleTyping = () => {
    if (!roomId) return

    // Set typing status ke true
    ChatService.setTyping(roomId, 'guest', true)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Auto-off after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      ChatService.setTyping(roomId, 'guest', false)
    }, 1000)
  }

  // === TOGGLE CHAT ===
  const toggleChat = () => {
    if (!isOpen && roomId) {
      // Mark messages as read when opening chat
      ChatService.markRead(roomId, 'guest')
    }

    setIsOpen(!isOpen)

    if (!isOpen) {
      setUnreadCount(0)
    }
  }

  // === HANDLE ENTER KEY ===
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }


  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-20 right-0 w-80 h-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md border border-white/30"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header dengan Admin Status */}
            <div
              className="text-gray-900 p-4 flex items-center justify-between border-b border-white/20"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    adminOnline ? 'bg-green-400' : 'bg-gray-400'
                  }`}
                ></div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">Customer Service</h3>
                  <p className="text-xs text-gray-700">
                    {adminOnline ? '✓ Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-300/20 rounded transition text-gray-900"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 flex flex-col p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-center">
                  <Image 
                    src="/logo-floating-buttom.png" 
                    alt="Chat Logo" 
                    width={95} 
                    height={95}
                    className="mb-2 opacity-50"
                  />
                  <p className="text-gray-900 text-xs">Mulai percakapan dengan tim kami</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'guest' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-lg px-3 py-2 max-w-xs text-sm ${
                        msg.sender === 'guest'
                          ? 'rounded-br-none text-white'
                          : 'rounded-bl-none text-gray-900'
                      } ${msg.pending ? 'opacity-60' : 'opacity-100'}`}
                      style={
                        msg.sender === 'guest'
                          ? {
                              background: 'rgba(59, 130, 246, 0.6)',
                              backdropFilter: 'blur(5px)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                            }
                          : {
                              background: 'rgba(255, 255, 255, 0.4)',
                              backdropFilter: 'blur(5px)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                            }
                      }
                    >
                      <div>{msg.message}</div>

                      {/* Message Footer dengan Time + Status */}
                      <div
                        className={`text-xs mt-1 flex items-center justify-between gap-1 ${
                          msg.sender === 'guest' ? 'text-blue-100' : 'text-gray-600'
                        }`}
                      >
                        <span title={formatFullDateTime(msg.created_at)}>{formatTimeWIB(msg.created_at)}</span>

                        {/* Read Receipts & Pending Status */}
                        {msg.sender === 'guest' && (
                          <span>
                            {msg.pending ? (
                              <span className="text-gray-400">• pending</span>
                            ) : msg.is_read ? (
                              <span className="text-gray-900">✔✔</span>
                            ) : (
                              <span className="text-gray-700">✔</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="rounded-lg px-3 py-2 rounded-bl-none text-gray-900 text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div className="flex gap-1 items-center">
                      <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              className="border-t border-white/20 p-3"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tulis pesan..."
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    handleTyping()
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none transition disabled:opacity-50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(5px)',
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="text-white rounded-lg p-2 transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(59, 130, 246, 0.8)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                  }}
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className="relative w-12 h-12 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-gray-900 border border-gray-400"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <X size={20} strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Image 
                src="/logo-floating-buttom.png" 
                alt="Chat" 
                width={50} 
                height={50}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Badge */}
        {!isOpen && unreadCount > 0 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-lg"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>
    </div>
  )
}

