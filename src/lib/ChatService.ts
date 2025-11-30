'use client'

import { getBrowserSupabaseClient } from './supabase'
import { isValidUUID } from './uuid-utils'
import type { Database } from '@/types/database.types'

// Logging - disabled for clean production console
const log = (...args: any[]) => {}  // Info logs disabled
const logError = (...args: any[]) => {}  // Error logs disabled

/**
 * Helper: Get Supabase client (lazy-loaded)
 */
function getClient(): any {
  return getBrowserSupabaseClient()
}

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
      const { data, error } = await getClient()
        .from('chat_rooms')
        .select('*')
        .eq('guest_id', guestId)
        .eq('is_closed', false)
        .single()

      if (data) {
        log('[ChatService] Room ditemukan:', data.id)
        // Return data as-is, primary key adalah 'id'
        return data
      }

      // Room tidak ada, create baru
      if (error && error.code === 'PGRST116') {
        // PGRST116 = no rows returned, ini normal untuk guest baru
        log('[ChatService] Room baru akan dibuat untuk guest:', guestId)

        const { data: newRoom, error: createError } = await getClient()
          .from('chat_rooms')
          .insert({
            guest_id: guestId,
            is_closed: false,
          })
          .select()
          .single()

        if (createError) {
          const errorMsg = formatError(createError)
          logError('[ChatService] Error membuat room:', errorMsg)
          throw createError
        }

        log('[ChatService] Room baru dibuat:', newRoom.id)
        // Return data as-is
        return newRoom
      }

      // Error lainnya
      if (error) {
        const errorMsg = formatError(error)
        logError('[ChatService] Error fetch room:', errorMsg)
        throw error
      }
    } catch (error) {
      const errorMsg = formatError(error)
      logError('[ChatService] getRoom error:', errorMsg)
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
        logError('[ChatService] Validation error:', errMsg)
        return { data: null, error: errMsg }
      }

      const trimmedText = text.trim()
      if (!trimmedText) {
        const errMsg = 'Message cannot be empty'
        logError('[ChatService] Validation error:', errMsg)
        return { data: null, error: errMsg }
      }

      // Insert message dengan created_at dari server (now()) dan pending: false
      const { data, error } = await getClient()
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
        logError('[ChatService] Error sending message:', errorMsg)
        return { data: null, error: errorMsg }
      }

      log('[ChatService] Message sent:', data.id)

      // Room's updated_at akan di-update otomatis oleh trigger database
      // Jadi tidak perlu update manual dari client

      return { data, error: null }
    } catch (error) {
      const errorMsg = formatError(error)
      logError('[ChatService] sendMessage exception:', errorMsg)
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

      const { error } = await getClient()
        .from('chat_messages')
        .update({ pending: false })
        .eq('id', messageId)

      if (error) {
        const errorMsg = formatError(error)
        logError('[ChatService] Error marking delivered:', errorMsg)
        return
      }

      log('[ChatService] Message marked delivered:', messageId)
    } catch (error) {
      const errorMsg = formatError(error)
      logError('[ChatService] markDelivered error:', errorMsg)
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

      const { error } = await getClient()
        .from('chat_messages')
        .update({
          is_read: true,
        })
        .eq('room_id', roomId)
        .eq('sender', readerType === 'admin' ? 'guest' : 'admin')

      if (error) {
        const errorMsg = formatError(error)
        logError('[ChatService] Error marking read:', errorMsg)
        return
      }

      log('[ChatService] Messages marked as read for room:', roomId)
    } catch (error) {
      const errorMsg = formatError(error)
      logError('[ChatService] markRead error:', errorMsg)
    }
  },

  /**
   * Assign admin ke chat room
   * @param roomId Room ID
   * @param adminId Admin ID (harus UUID yang valid)
   */
  async assignAdmin(roomId: string, adminId: string) {
    try {
      if (!roomId || !adminId) {
        console.warn('[ChatService] assignAdmin: roomId atau adminId kosong')
        return
      }

      // Validasi adminId adalah UUID yang valid
      if (!isValidUUID(adminId)) {
        logError('[ChatService] assignAdmin: adminId bukan UUID yang valid:', adminId)
        return
      }

      const { error } = await getClient()
        .from('chat_rooms')
        .update({
          assigned_admin: adminId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', roomId)

      if (error) {
        const errorMsg = formatError(error)
        logError('[ChatService] Error assigning admin:', errorMsg)
        return
      }

      log(`[ChatService] Admin ${adminId} assigned to room ${roomId}`)
    } catch (error) {
      const errorMsg = formatError(error)
      logError('[ChatService] assignAdmin error:', errorMsg)
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

      const { error } = await getClient().from('chat_typing').upsert({
        room_id: roomId,
        sender,
        typing,
      })

      if (error) {
        const errorMsg = formatError(error)
        logError('[ChatService] Error setting typing:', errorMsg)
        return
      }

      log(`[ChatService] ${sender} typing: ${typing}`)
    } catch (error) {
      const errorMsg = formatError(error)
      logError('[ChatService] setTyping error:', errorMsg)
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

      const { data, error } = await getClient()
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) {
        const errorMsg = formatError(error)
        logError('[ChatService] Error fetching messages:', errorMsg)
        return []
      }

      return data || []
    } catch (error) {
      const errorMsg = formatError(error)
      logError('[ChatService] getMessages error:', errorMsg)
      return []
    }
  },

  /**
   * Get all active rooms untuk admin (with unread count)
   * @returns Array of rooms
   */
  async getAllRooms() {
    try {
      const { data, error } = await getClient()
        .from('chat_rooms')
        .select('*')
        .eq('is_closed', false)
        .order('updated_at', { ascending: false })

      if (error) {
        const errorMsg = formatError(error)
        logError('[ChatService] Error fetching all rooms:', errorMsg)
        return []
      }

      return data || []
    } catch (error) {
      const errorMsg = formatError(error)
      logError('[ChatService] getAllRooms error:', errorMsg)
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

      const { error } = await getClient()
        .from('chat_rooms')
        .update({ 
          is_closed: true
        })
        .eq('id', roomId)

      if (error) {
        const errorMsg = formatError(error)
        logError('[ChatService] Error closing room:', errorMsg)
        return
      }

      log('[ChatService] Room closed:', roomId)
    } catch (error) {
      const errorMsg = formatError(error)
      logError('[ChatService] closeRoom error:', errorMsg)
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

      // Gunakan UPSERT untuk menghindari duplicate key error
      const { error } = await getClient()
        .from('admin_status')
        .upsert({
          admin_id: adminId,
          status: 'online',
          last_activity: now,
        }, {
          onConflict: 'admin_id'
        })

      if (error) {
        const errorMsg = formatError(error)
        console.warn('[ChatService] Error updating admin online:', errorMsg)
        return false
      }

      log('[ChatService] Admin online status updated:', adminId)
      return true
    } catch (error) {
      const errorMsg = formatError(error)
      logError('[ChatService] setAdminOnline error:', errorMsg)
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
      // Gunakan UPSERT untuk konsistensi
      const { error } = await getClient()
        .from('admin_status')
        .upsert({
          admin_id: adminId,
          status: 'offline',
          last_activity: new Date().toISOString(),
        }, {
          onConflict: 'admin_id'
        })

      if (error) {
        const errorMsg = formatError(error)
        console.warn('[ChatService] Error setting admin offline:', errorMsg)
        return false
      }

      log('[ChatService] Admin offline status updated:', adminId)
      return true
    } catch (error) {
      const errorMsg = formatError(error)
      logError('[ChatService] setAdminOffline error:', errorMsg)
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

      const { data, error } = await getClient()
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
      log('[ChatService] Specific admin online status:', adminId, isOnline)
      return isOnline
    } catch (error) {
      const errorMsg = formatError(error)
      logError('[ChatService] isSpecificAdminOnline error:', errorMsg)
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

      const { data, error } = await getClient()
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
      return isOnline
    } catch (error) {
      const errorMsg = formatError(error)
      logError('[ChatService] isAdminOnline error:', errorMsg)
      return false
    }
  },
}

