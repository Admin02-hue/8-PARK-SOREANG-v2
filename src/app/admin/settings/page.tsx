'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Save, LogOut, Mail, Phone, User, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone_number?: string
  role: string
  is_active: boolean
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' })

  useEffect(() => {
    let isMounted = true
    let subscription: any

    const init = async () => {
      if (isMounted) await checkAuth()
    }

    init()

    return () => {
      isMounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      if (!supabase) {
        router.push('/admin/login')
        return
      }

      const { data: sessionData } = await (supabase as any).auth.getSession()
      
      if (!sessionData.session) {
        router.push('/admin/login')
        return
      }

      setUser(sessionData.session.user)
      fetchProfile(sessionData.session.user.id)

      // Setup realtime subscription for profile changes
      const subscription = (supabase as any)
        .channel('settings-' + sessionData.session.user.id)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users', filter: `id=eq.${sessionData.session.user.id}` },
          (payload: any) => {
            console.log('✅ Profile change detected, refreshing...')
            fetchProfile(sessionData.session.user.id)
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Settings page realtime subscription active')
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Subscription error, but will continue')
          }
        })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching profile for user:', userId)

      // Use API endpoint to bypass RLS recursion issue
      const response = await fetch(`/api/admin/profile?userId=${userId}`)
      const result = await response.json()

      if (!response.ok) {
        console.warn('⚠️ Error fetching profile:', result.error)
        return
      }

      const data = result.data

      if (data) {
        console.log('✅ Profile found:', data)
        setProfile(data)
        setEditedProfile({
          full_name: data.full_name,
          phone_number: data.phone_number,
        })
      } else {
        console.log('ℹ️ No profile found for user, will create new on save')
      }
    } catch (error) {
      console.error('❌ Critical error in fetchProfile:', error)
      // Don't show error - profile might be new
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // Use API endpoint to bypass RLS recursion issue
      const response = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          fullName: editedProfile.full_name,
          phoneNumber: editedProfile.phone_number,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan profil')
      }

      console.log('✅ Profile updated:', result.data)
      toast.success('Profil berhasil disimpan')
      fetchProfile(user.id)
    } catch (error) {
      console.error('Error saving profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan profil'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwords.new || !passwords.confirm) {
      toast.error('Password tidak boleh kosong')
      return
    }

    if (passwords.new !== passwords.confirm) {
      toast.error('Password baru tidak cocok')
      return
    }

    if (passwords.new.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    setIsSaving(true)
    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await (supabase as any).auth.updateUser({
        password: passwords.new,
      })

      if (error) throw error
      toast.success('Password berhasil diubah')
      setShowPasswordModal(false)
      setPasswords({ old: '', new: '', confirm: '' })
    } catch (error) {
      toast.error('Gagal mengubah password')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      await (supabase as any).auth.signOut()
      toast.success('Logout berhasil')
      router.push('/admin/login')
    } catch (error) {
      toast.error('Logout gagal')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
          <p className="mt-4 text-gray-300">Memuat pengaturan...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
          <p className="text-sm text-gray-300">Kelola akun dan preferensi Anda</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Profil Akun</h2>

          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={editedProfile.full_name || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nomor Telepon</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  value={editedProfile.phone_number || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone_number: e.target.value })}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>

            {/* Role (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
              <input
                type="text"
                value={profile?.role || 'staff'}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Save Button */}
            <Button
              variant="gold"
              fullWidth
              onClick={handleSaveProfile}
              isLoading={isSaving}
              className="flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </Button>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Keamanan</h2>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center justify-center gap-2 text-white hover:bg-white/20"
          >
            <Lock className="w-4 h-4" />
            Ubah Password
          </Button>
        </div>

        {/* Logout Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Sesi</h2>

          <Button
            variant="primary"
            fullWidth
            onClick={handleLogout}
            className="flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 border border-white/20 rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-6">Ubah Password</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password Baru</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  placeholder="Masukkan password baru"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Konfirmasi Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Konfirmasi password baru"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <p className="text-xs text-gray-400">Minimal 6 karakter</p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                Batal
              </Button>
              <Button
                variant="gold"
                onClick={handleChangePassword}
                isLoading={isSaving}
              >
                Ubah Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
