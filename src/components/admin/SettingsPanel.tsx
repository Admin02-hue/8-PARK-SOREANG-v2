'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { LogOut, Eye, EyeOff, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  email: string
  fullName?: string
  phoneNumber?: string
}

export default function SettingsPanel() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  })

  useEffect(() => {
    let isMounted = true
    let subscription: any

    const init = async () => {
      if (isMounted) await fetchProfile()

      try {
        const supabase = createBrowserSupabaseClient()
        if (!supabase) return

        // Get current user ID for subscription
        const { data: sessionData } = await (supabase as any).auth.getSession()
        const userId = sessionData?.session?.user?.id

        if (userId) {
          // Subscribe to users table changes
          subscription = supabase
            .channel('settings-profile-' + userId)
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
              (payload: any) => {
                if (isMounted) {
                  console.log('✅ Profile change detected, refreshing...')
                  fetchProfile()
                }
              }
            )
            .subscribe((status: string) => {
              if (status === 'SUBSCRIBED') {
                console.log('✅ Settings realtime subscription active')
              } else if (status === 'CHANNEL_ERROR') {
                console.warn('⚠️ Subscription error, but will continue')
              }
            })
        }
      } catch (error) {
        console.error('❌ Error setting up subscription:', error)
      }
    }

    init()

    return () => {
      isMounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client tidak tersedia')
      }

      const { data: sessionData } = await (supabase as any).auth.getSession()

      if (!sessionData?.session?.user) {
        console.warn('⚠️ No session found, redirecting to login')
        router.push('/admin/login')
        return
      }

      const user = sessionData.session.user
      console.log('👤 Fetching profile for user:', user.id)

      // Use API endpoint to bypass RLS recursion issue
      const response = await fetch(`/api/admin/profile?userId=${user.id}`)
      const result = await response.json()

      if (!response.ok) {
        console.warn('⚠️ Error fetching profile:', result.error)
      }

      const userProfile = result.data

      const profile: UserProfile = {
        id: user.id,
        email: user.email || '',
        fullName: userProfile?.full_name || '',
        phoneNumber: userProfile?.phone_number || '',
      }

      console.log('✅ Profile loaded:', profile)
      setProfile(profile)
      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
      })
    } catch (error) {
      console.error('❌ Critical error in fetchProfile:', error)
      // Don't show error toast - user profile might be new
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      if (!profile?.id) {
        toast.error('ID profil tidak ditemukan')
        return
      }

      setIsSaving(true)

      // Use API endpoint to bypass RLS recursion issue
      const response = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profile.id,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal memperbarui profil')
      }

      console.log('✅ Profile updated:', result.data)
      toast.success('Profil berhasil diperbarui')
      setIsEditingProfile(false)
      // Fetch profile untuk refresh data
      await fetchProfile()
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui profil'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password baru tidak cocok')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await (supabase as any).auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (error) throw error

      toast.success('Password berhasil diubah')
      setIsChangingPassword(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false,
      })
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Gagal mengubah password')
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await (supabase as any).auth.signOut()

      if (error) throw error

      toast.success('Berhasil logout')
      router.push('/admin/login')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Gagal logout')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
          <p className="mt-4 text-gray-300">Memuat pengaturan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      {/* Panel Container with glass effect */}
      <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Pengaturan Akun</h2>
          <p className="text-sm text-gray-300">Kelola profil dan keamanan akun Anda</p>
        </div>

      {/* Profile Section */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-white/20">
          <div className="p-3 bg-gold-500/20 rounded-lg">
            <User className="w-6 h-6 text-gold-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Profil Akun</h3>
            <p className="text-sm text-gray-400">{profile?.email}</p>
          </div>
        </div>

        {!isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Nama Lengkap</p>
              <p className="text-white text-lg mt-1">{profile?.fullName || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Nomor Telepon</p>
              <p className="text-white text-lg mt-1">{profile?.phoneNumber || '-'}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditingProfile(true)}
              className="w-full"
            >
              Edit Profil
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 block mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-2">Nomor Telepon</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="Masukkan nomor telepon"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="gold"
                onClick={handleUpdateProfile}
                className="flex-1"
              >
                Simpan Perubahan
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditingProfile(false)}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-white/20">
          <div className="p-3 bg-red-500/20 rounded-lg">
            <Lock className="w-6 h-6 text-red-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Keamanan</h3>
            <p className="text-sm text-gray-400">Kelola password dan keamanan akun</p>
          </div>
        </div>

        {!isChangingPassword ? (
          <Button
            variant="outline"
            onClick={() => setIsChangingPassword(true)}
            className="w-full"
          >
            Ubah Password
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <label className="text-sm text-gray-300 block mb-2">Password Saat Ini</label>
              <div className="relative">
                <input
                  type={passwordForm.showCurrent ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Masukkan password saat ini"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPasswordForm({ ...passwordForm, showCurrent: !passwordForm.showCurrent })
                  }
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-300"
                >
                  {passwordForm.showCurrent ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="text-sm text-gray-300 block mb-2">Password Baru</label>
              <div className="relative">
                <input
                  type={passwordForm.showNew ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Masukkan password baru"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPasswordForm({ ...passwordForm, showNew: !passwordForm.showNew })
                  }
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-300"
                >
                  {passwordForm.showNew ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="text-sm text-gray-300 block mb-2">Konfirmasi Password Baru</label>
              <div className="relative">
                <input
                  type={passwordForm.showConfirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Konfirmasi password baru"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPasswordForm({ ...passwordForm, showConfirm: !passwordForm.showConfirm })
                  }
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-300"
                >
                  {passwordForm.showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="gold"
                onClick={handleChangePassword}
                className="flex-1"
              >
                Ubah Password
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsChangingPassword(false)
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                    showCurrent: false,
                    showNew: false,
                    showConfirm: false,
                  })
                }}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Section */}
      <Button
        onClick={handleLogout}
        className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
      </div>
    </div>
  )
}
