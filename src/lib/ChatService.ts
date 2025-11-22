'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

const supabase = createClientComponentClient<Database>()

/**
 * Helper: Format error object untuk logging
 */
function formatError(error: any): string {
  if (!error) return 'Unknown error'
  
  try {
    // Jika error sudah string
    if (typeof error === 'string') return error
    
    // Extract properties dari error object
    const message = error?.message || 'Unknown error'
    const code = error?.code || 'N/A'
    const status = error?.status || 'N/A'
    const details = error?.details || ''
    const hint = error?.hint || ''
    
    // Format jadi readable string
    let errorStr = `Message: ${message}`
    if (code !== 'N/A') errorStr += ` | Code: ${code}`
    if (status !== 'N/A') errorStr += ` | Status: ${status}`
    if (details) errorStr += ` | Details: ${details}`
    if (hint) errorStr += ` | Hint: ${hint}`
    
    return errorStr
  } catch (e) {
    return String(error)
  }
}

/**
 * Chat Service - Enterprise Grade Chat Engine
 * ==========================================
 * Handles:
 * - Room creation & retrieval
 * - Message sending & delivery tracking
 * - Message read receipts
 * - Admin presence/online status
 * - Typing indicators
 * - Real-time updates via Supabase
 */

export const ChatService = {
  /**
   * Get atau create chat room untuk guest
   * @param guestId UUID dari guest/visitor
   * @returns Chat room object
   */
  async getRoom(guestId: string) {
    try {
      // Cek room yang sudah ada
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('guest_id', guestId)
        .eq('is_closed', false)
        .single()

      if (data) {
        console.log('[ChatService] Room ditemukan:', data.id)
        // Return data as-is, primary key adalah 'id'
        return data
      }

      // Room tidak ada, create baru
      if (error && error.code === 'PGRST116') {
        // PGRST116 = no rows returned, ini normal untuk guest baru
        console.log('[ChatService] Room baru akan dibuat untuk guest:', guestId)

        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            guest_id: guestId,
            is_closed: false,
          })
          .select()
          .single()

        if (createError) {
          const errorMsg = formatError(createError)
          console.error('[ChatService] Error membuat room:', errorMsg)
          throw createError
        }

        console.log('[ChatService] Room baru dibuat:', newRoom.id)
        // Return data as-is
        return newRoom
      }

      // Error lainnya
      if (error) {
        const errorMsg = formatError(error)
        console.error('[ChatService] Error fetch room:', errorMsg)
        throw error
      }
    } catch (error) {
      const errorMsg = formatError(error)
      console.error('[ChatService] getRoom error:', errorMsg)
      throw error
    }
  },

  /**
   * Send message ke chat room
   * @param roomId Room ID
   * @param text Message text
   * @param sender 'guest' atau 'admin'
   * @returns { data, error }
   */
  async sendMessage(
    roomId: string,
    text: string,
    sender: 'guest' | 'admin'
  ) {
    try {
      if (!roomId || !text || !sender) {
        const errMsg = 'Missing required fields: roomId, text, or sender'
        console.error('[ChatService] Validation error:', errMsg)
        return { data: null, error: errMsg }
      }

      const trimmedText = text.trim()
      if (!trimmedText) {
        const errMsg = 'Message cannot be empty'
        console.error('[ChatService] Validation error:', errMsg)
        return { data: null, error: errMsg }
      }

      // Insert message dengan created_at dari server (now()) dan pending: false
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          message: trimmedText,
          sender,
          pending: false,
          is_read: false,
        })
        .select()
        .single()

      if (error) {
        const errorMsg = formatError(error)
        console.error('[ChatService] Error sending message:', errorMsg)
        return { data: null, error: errorMsg }
      }

      console.log('[ChatService] Message sent:', data.id)

      // Room's updated_at akan di-update otomatis oleh trigger database
      // Jadi tidak perlu update manual dari client

      return { data, error: null }
    } catch (error) {
      const errorMsg = formatError(error)
      console.error('[ChatService] sendMessage exception:', errorMsg)
      return { data: null, error: errorMsg }
    }
  },

  /**
   * Mark message sebagai delivered (pending: false)
   * @param messageId ID pesan
   */
  async markDelivered(messageId: string) {
    try {
      if (!messageId) return

      const { error } = await supabase
        .from('chat_messages')
        .update({ pending: false })
        .eq('id', messageId)

      if (error) {
        const errorMsg = formatError(error)
        console.error('[ChatService] Error marking delivered:', errorMsg)
        return
      }

      console.log('[ChatService] Message marked delivered:', messageId)
    } catch (error) {
      const errorMsg = formatError(error)
      console.error('[ChatService] markDelivered error:', errorMsg)
    }
  },

  /**
   * Mark semua message di room sebagai read
   * @param roomId Room ID
   * @param readerType 'admin' atau 'guest'
   */
  async markRead(roomId: string, readerType: 'admin' | 'guest' = 'admin') {
    try {
      if (!roomId) return

      const { error } = await supabase
        .from('chat_messages')
        .update({
          is_read: true,
        })
        .eq('room_id', roomId)
        .eq('sender', readerType === 'admin' ? 'guest' : 'admin')

      if (error) {
        const errorMsg = formatError(error)
        console.error('[ChatService] Error marking read:', errorMsg)
        return
      }

      console.log('[ChatService] Messages marked as read for room:', roomId)
    } catch (error) {
      const errorMsg = formatError(error)
      console.error('[ChatService] markRead error:', errorMsg)
    }
  },

  /**
   * Assign admin ke chat room
   * @param roomId Room ID
   * @param adminId Admin ID (text)
   */
  async assignAdmin(roomId: string, adminId: string) {
    try {
      if (!roomId || !adminId) return

      const { error } = await supabase
        .from('chat_rooms')
        .update({
          assigned_admin: adminId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', roomId)

      if (error) {
        const errorMsg = formatError(error)
        console.error('[ChatService] Error assigning admin:', errorMsg)
        return
      }

      console.log(`[ChatService] Admin ${adminId} assigned to room ${roomId}`)
    } catch (error) {
      const errorMsg = formatError(error)
      console.error('[ChatService] assignAdmin error:', errorMsg)
    }
  },

  /**
   * Set typing indicator status
   * @param roomId Room ID
   * @param sender 'guest' atau 'admin'
   * @param typing true/false
   */
  async setTyping(roomId: string, sender: 'guest' | 'admin', typing: boolean) {
    try {
      if (!roomId || !sender) return

      const { error } = await supabase.from('chat_typing').upsert({
        room_id: roomId,
        sender,
        typing,
      })

      if (error) {
        const errorMsg = formatError(error)
        console.error('[ChatService] Error setting typing:', errorMsg)
        return
      }

      console.log(`[ChatService] ${sender} typing: ${typing}`)
    } catch (error) {
      const errorMsg = formatError(error)
      console.error('[ChatService] setTyping error:', errorMsg)
    }
  },

  /**
   * Get all messages untuk room tertentu
   * @param roomId Room ID
   * @returns Array of messages
   */
  async getMessages(roomId: string) {
    try {
      if (!roomId) return []

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) {
        const errorMsg = formatError(error)
        console.error('[ChatService] Error fetching messages:', errorMsg)
        return []
      }

      return data || []
    } catch (error) {
      const errorMsg = formatError(error)
      console.error('[ChatService] getMessages error:', errorMsg)
      return []
    }
  },

  /**
   * Get all active rooms untuk admin (with unread count)
   * @returns Array of rooms
   */
  async getAllRooms() {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_closed', false)
        .order('updated_at', { ascending: false })

      if (error) {
        const errorMsg = formatError(error)
        console.error('[ChatService] Error fetching all rooms:', errorMsg)
        return []
      }

      return data || []
    } catch (error) {
      const errorMsg = formatError(error)
      console.error('[ChatService] getAllRooms error:', errorMsg)
      return []
    }
  },

  /**
   * Close chat room (set is_closed: true)
   * @param roomId Room ID
   */
  async closeRoom(roomId: string) {
    try {
      if (!roomId) return

      const { error } = await supabase
        .from('chat_rooms')
        .update({ 
          is_closed: true
        })
        .eq('id', roomId)

      if (error) {
        const errorMsg = formatError(error)
        console.error('[ChatService] Error closing room:', errorMsg)
        return
      }

      console.log('[ChatService] Room closed:', roomId)
    } catch (error) {
      const errorMsg = formatError(error)
      console.error('[ChatService] closeRoom error:', errorMsg)
    }
  },

  /**
   * Set admin status sebagai online dengan timestamp
   * @param adminId ID dari admin
   * @returns true jika berhasil
   */
  async setAdminOnline(adminId: string) {
    try {
      const now = new Date().toISOString()

      // Coba update dulu
      const { data: existingData, error: checkError } = await supabase
        .from('admin_status')
        .select('id')
        .eq('admin_id', adminId)
        .single()

      if (existingData) {
        // Sudah ada, update saja
        const { error } = await supabase
          .from('admin_status')
          .update({
            status: 'online',
            last_activity: now,
          })
          .eq('admin_id', adminId)

        if (error) {
          const errorMsg = formatError(error)
          console.warn('[ChatService] Error updating admin online:', errorMsg)
          return false
        }
      } else {
        // Belum ada, insert baru
        const { error } = await supabase
          .from('admin_status')
          .insert({
            admin_id: adminId,
            status: 'online',
            last_activity: now,
          })

        if (error) {
          const errorMsg = formatError(error)
          console.warn('[ChatService] Error inserting admin online:', errorMsg)
          return false
        }
      }

      console.log('[ChatService] Admin online status updated:', adminId)
      return true
    } catch (error) {
      const errorMsg = formatError(error)
      console.error('[ChatService] setAdminOnline error:', errorMsg)
      return false
    }
  },

  /**
   * Set admin status sebagai offline
   * @param adminId ID dari admin
   * @returns true jika berhasil
   */
  async setAdminOffline(adminId: string) {
    try {
      // Coba update dulu
      const { data: existingData } = await supabase
        .from('admin_status')
        .select('id')
        .eq('admin_id', adminId)
        .single()

      if (existingData) {
        // Update status ke offline
        const { error } = await supabase
          .from('admin_status')
          .update({
            status: 'offline',
            last_activity: new Date().toISOString(),
          })
          .eq('admin_id', adminId)

        if (error) {
          const errorMsg = formatError(error)
          console.warn('[ChatService] Error setting admin offline:', errorMsg)
          return false
        }
      } else {
        // Insert baru
        const { error } = await supabase
          .from('admin_status')
          .insert({
            admin_id: adminId,
            status: 'offline',
            last_activity: new Date().toISOString(),
          })

        if (error) {
          const errorMsg = formatError(error)
          console.warn('[ChatService] Error inserting admin offline:', errorMsg)
          return false
        }
      }

      console.log('[ChatService] Admin offline status updated:', adminId)
      return true
    } catch (error) {
      const errorMsg = formatError(error)
      console.error('[ChatService] setAdminOffline error:', errorMsg)
      return false
    }
  },

  /**
   * Check apakah admin tertentu online
   * @param adminId ID dari admin
   * @returns true jika admin online, false jika tidak
   */
  async isSpecificAdminOnline(adminId: string) {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('admin_status')
        .select('*')
        .eq('admin_id', adminId)
        .eq('status', 'online')
        .gt('last_activity', fiveMinutesAgo)
        .maybeSingle()

      if (error) {
        const errorMsg = formatError(error)
        console.warn('[ChatService] Error checking specific admin online:', errorMsg)
        // Return false saat error, jangan throw
        return false
      }

      const isOnline = !!data
      console.log('[ChatService] Specific admin online status:', adminId, isOnline)
      return isOnline
    } catch (error) {
      const errorMsg = formatError(error)
      console.error('[ChatService] isSpecificAdminOnline error:', errorMsg)
      return false
    }
  },

  /**
   * Check apakah ada admin yang aktif (last_activity < 5 menit)
   * @returns true jika ada admin online, false jika tidak
   */
  async isAdminOnline() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('admin_status')
        .select('id')
        .eq('status', 'online')
        .gt('last_activity', fiveMinutesAgo)
        .limit(1)

      if (error) {
        // PGRST116 = no rows, yang mana fine
        const errorMsg = formatError(error)
        if (!error.message.includes('PGRST116')) {
          console.warn('[ChatService] Error checking admin online:', errorMsg)
        }
      }

      const isOnline = data && data.length > 0
      console.log('[ChatService] Any admin online status:', isOnline)
      return isOnline
    } catch (error) {
      const errorMsg = formatError(error)
      console.error('[ChatService] isAdminOnline error:', errorMsg)
      return false
    }
  },
}
