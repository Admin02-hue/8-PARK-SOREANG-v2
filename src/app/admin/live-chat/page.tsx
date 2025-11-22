/**
 * 👨‍💼 ADMIN LIVE CHAT PAGE
 * FILE: src/app/admin/live-chat/page.tsx
 * 
 * ROUTE: /admin/live-chat
 * DESKRIPSI: Halaman untuk admin mengelola semua live chat dengan pengunjung
 * 
 * FITUR:
 * ✅ List semua active chat rooms (realtime)
 * ✅ View conversation dari setiap room
 * ✅ Send reply admin
 * ✅ Close chat room
 * ✅ Notification unread messages
 */

import AdminChatPanel from '@/components/chat/AdminChatPanel'

export default function AdminLiveChatPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Live Chat Management</h1>
        <p className="text-gray-300">
          Kelola percakapan real-time dengan pengunjung website
        </p>
      </div>

      {/* Chat Panel Component */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden" style={{ height: '600px' }}>
        <AdminChatPanel />
      </div>

      {/* Info Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">💬 Percakapan Aktif</h3>
          <p className="text-gray-300 text-sm">
            Semua chat rooms dari pengunjung yang belum ditutup
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">⚡ Real-Time Sync</h3>
          <p className="text-gray-300 text-sm">
            Pesan ter-update secara otomatis tanpa perlu refresh
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">📱 Visitor Info</h3>
          <p className="text-gray-300 text-sm">
            Lihat informasi kontak pengunjung di setiap room
          </p>
        </div>
      </div>
    </div>
  )
}
