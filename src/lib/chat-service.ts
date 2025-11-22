/**
 * Chat Service
 * ============
 * Service untuk manage real-time chat operations
 * Digunakan oleh FloatingChatButton dan LiveChatPanel
 */

import { createBrowserSupabaseClient } from './supabase'
import type { ChatRoom, ChatMessage } from '@/types/database.types'

// Helper function untuk format error logging
function logError(context: string, error: any) {
  if (!error) {
    console.error(`[${context}] Unknown error`)
    return
  }

  try {
    const errorMessage = error?.message ? String(error.message) : 'Unknown error'
    const errorCode = error?.code ? String(error.code) : 'UNKNOWN'
    const errorStatus = error?.status ? String(error.status) : 'N/A'
    const errorDetails = error?.details ? String(error.details) : ''
    const errorHint = error?.hint ? String(error.hint) : ''

    // Format sebagai string untuk avoid serialization issues
    const errorStr = `
      Context: ${context}
      Message: ${errorMessage}
      Code: ${errorCode}
      Status: ${errorStatus}
      ${errorDetails ? `Details: ${errorDetails}` : ''}
      ${errorHint ? `Hint: ${errorHint}` : ''}
    `.trim()

    console.error(errorStr)
  } catch (e) {
    console.error(`[${context}] Error occurred:`, String(error))
  }
}

export class ChatService {
  private static supabase: ReturnType<typeof createBrowserSupabaseClient> | null = null

  private static getSupabase() {
    if (!this.supabase) {
      try {
        this.supabase = createBrowserSupabaseClient()
      } catch (error) {
        logError('ChatService:initialization', error)
        return null
      }
    }
    return this.supabase
  }

  /**
   * Get atau create chat room untuk guest
   */
  static async getOrCreateChatRoom(guestId: string): Promise<ChatRoom | null> {
    try {
      // Validate guestId
      if (!guestId || typeof guestId !== 'string') {
        logError('getOrCreateChatRoom:validation', new Error('Invalid guestId'))
        return null
      }

      const supabase = this.getSupabase()
      if (!supabase) {
        logError('getOrCreateChatRoom:nosupabase', new Error('Supabase client not initialized'))
        return null
      }

      // Cek room yang sudah ada
      const { data: existingRoom, error: fetchError } = await (supabase as any)
        .from('chat_rooms')
        .select('*')
        .eq('guest_id', guestId)
        .single()

      // Error code PGRST116 = no rows returned (normal untuk guest baru)
      if (fetchError && fetchError.code !== 'PGRST116') {
        logError('getOrCreateChatRoom:fetch', fetchError)
        return null
      }

      if (existingRoom) {
        return existingRoom as ChatRoom
      }

      // Create room baru
      const now = new Date().toISOString()
      const { data: newRoom, error: createError } = await (supabase as any)
        .from('chat_rooms')
        .insert({
          guest_id: guestId,
          is_active: true,
          created_at: now,
          last_activity: now,
        })
        .select()
        .single()

      if (createError) {
        logError('getOrCreateChatRoom:create', createError)
        return null
      }

      if (!newRoom) {
        logError('getOrCreateChatRoom:nodata', new Error('No room returned from insert'))
        return null
      }

      return newRoom as ChatRoom
    } catch (error) {
      logError('getOrCreateChatRoom', error)
      return null
    }
  }

  /**
   * Get all messages untuk room tertentu
   */
  static async getMessages(roomId: string): Promise<ChatMessage[]> {
    try {
      if (!roomId || typeof roomId !== 'string') {
        logError('getMessages:validation', new Error('Invalid roomId'))
        return []
      }

      const supabase = this.getSupabase()
      if (!supabase) {
        logError('getMessages:nosupabase', new Error('Supabase client not initialized'))
        return []
      }

      const { data: messages, error } = await (supabase as any)
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) {
        logError('getMessages', error)
        return []
      }

      return (messages || []) as ChatMessage[]
    } catch (error) {
      logError('getMessages', error)
      return []
    }
  }

  /**
   * Send message dari guest atau admin
   */
  static async sendMessage(
    roomId: string,
    message: string,
    sender: 'guest' | 'admin',
    guestId?: string
  ): Promise<ChatMessage | null> {
    try {
      // Validate inputs
      if (!roomId || typeof roomId !== 'string' || !roomId.trim()) {
        logError('sendMessage:validation', new Error('Invalid roomId'))
        return null
      }

      if (!message || typeof message !== 'string' || !message.trim()) {
        logError('sendMessage:validation', new Error('Invalid message content'))
        return null
      }

      if (!sender || !['guest', 'admin'].includes(sender)) {
        logError('sendMessage:validation', new Error('Invalid sender type'))
        return null
      }

      const supabase = this.getSupabase()
      if (!supabase) {
        logError('sendMessage:init', new Error('Supabase not initialized'))
        return null
      }

      const trimmedMessage = message.trim()
      const messageData = {
        room_id: roomId,
        guest_id: guestId && typeof guestId === 'string' ? guestId : null,
        sender,
        message: trimmedMessage,
        created_at: new Date().toISOString(),
      }

      console.log('[ChatService] Sending message:', messageData)

      const { data: newMessage, error: insertError } = await (supabase as any)
        .from('messages')
        .insert([messageData])
        .select()
        .single()

      if (insertError) {
        logError('sendMessage:insert', insertError)
        return null
      }

      if (!newMessage) {
        logError('sendMessage:nodata', new Error('No message returned from insert'))
        return null
      }

      // Update last_message di chat_rooms (non-blocking)
      try {
        const { error: updateError } = await (supabase as any)
          .from('chat_rooms')
          .update({
            last_message: trimmedMessage,
            last_activity: new Date().toISOString(),
          })
          .eq('room_id', roomId)

        if (updateError) {
          console.warn('[ChatService] Warning: Failed to update chat_rooms timestamp:', updateError?.message)
          // Don't fail if room update fails, message was already saved
        }
      } catch (error) {
        console.warn('[ChatService] Error updating room timestamp:', error instanceof Error ? error.message : String(error))
      }

      console.log('[ChatService] Message sent successfully:', newMessage)
      return newMessage as ChatMessage
    } catch (error) {
      logError('sendMessage:exception', error)
      return null
    }
  }

  /**
   * Get semua active chat rooms (untuk admin)
   */
  static async getAllChatRooms(): Promise<ChatRoom[]> {
    try {
      const supabase = this.getSupabase()
      if (!supabase) {
        logError('getAllChatRooms:nosupabase', new Error('Supabase client not initialized'))
        return []
      }

      const { data: rooms, error } = await (supabase as any)
        .from('chat_rooms')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false })

      if (error) {
        logError('getAllChatRooms', error)
        return []
      }

      return (rooms || []) as ChatRoom[]
    } catch (error) {
      logError('getAllChatRooms', error)
      return []
    }
  }

  /**
   * Close chat room
   */
  static async closeChatRoom(roomId: string): Promise<boolean> {
    try {
      if (!roomId || typeof roomId !== 'string') {
        logError('closeChatRoom:validation', new Error('Invalid roomId'))
        return false
      }

      const supabase = this.getSupabase()
      if (!supabase) {
        logError('closeChatRoom:nosupabase', new Error('Supabase client not initialized'))
        return false
      }

      const { error } = await (supabase as any)
        .from('chat_rooms')
        .update({ is_active: false })
        .eq('room_id', roomId)

      if (error) {
        logError('closeChatRoom', error)
        return false
      }

      return true
    } catch (error) {
      logError('closeChatRoom', error)
      return false
    }
  }

  /**
   * Subscribe to new messages di room tertentu
   */
  static subscribeToMessages(
    roomId: string,
    callback: (message: ChatMessage) => void
  ) {
    if (!roomId || typeof roomId !== 'string') {
      logError('subscribeToMessages:validation', new Error('Invalid roomId'))
      return
    }

    const supabase = this.getSupabase()
    if (!supabase) {
      logError('subscribeToMessages:nosupabase', new Error('Supabase client not initialized'))
      return
    }

    const channel = supabase
      .channel(`messages_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: any) => {
          callback(payload.new as ChatMessage)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  /**
   * Subscribe to room updates (last_message, last_activity)
   */
  static subscribeToRoomUpdates(
    roomId: string,
    callback: (room: ChatRoom) => void
  ) {
    if (!roomId || typeof roomId !== 'string') {
      logError('subscribeToRoomUpdates:validation', new Error('Invalid roomId'))
      return
    }

    const supabase = this.getSupabase()
    if (!supabase) {
      logError('subscribeToRoomUpdates:nosupabase', new Error('Supabase client not initialized'))
      return
    }

    const channel = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_rooms',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: any) => {
          callback(payload.new as ChatRoom)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  /**
   * Subscribe to new chat rooms (untuk admin dashboard)
   */
  static subscribeToNewRooms(
    callback: (room: ChatRoom) => void
  ) {
    const supabase = this.getSupabase()
    if (!supabase) {
      logError('subscribeToNewRooms:nosupabase', new Error('Supabase client not initialized'))
      return
    }

    const channel = supabase
      .channel('new_chat_rooms')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_rooms',
        },
        (payload: any) => {
          callback(payload.new as ChatRoom)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}
