'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserSupabaseClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface TestResult {
  name: string
  status: 'pending' | 'pass' | 'fail'
  message: string
  duration: number
}

export default function SmokeTestPage() {
  const router = useRouter()
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [testStart, setTestStart] = useState(Date.now())
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = getBrowserSupabaseClient()
    if (!supabase) {
      toast.error('Supabase not initialized')
      setLoading(false)
      return
    }

    try {
      const { data: sessionData } = await (supabase as any).auth.getSession()
      if (sessionData?.session?.user) {
        setAuthorized(true)
        runAllTests()
      } else {
        toast.error('Please login first')
        router.push('/admin/login')
      }
    } catch (error) {
      toast.error('Auth check failed')
      setLoading(false)
    }
  }

  const addResult = (name: string, status: 'pass' | 'fail', message: string, duration: number) => {
    setResults((prev) => [...prev, { name, status, message, duration }])
  }

  const runAllTests = async () => {
    if (!authorized) return
    setTestStart(Date.now())
    setResults([])

    const supabase = getBrowserSupabaseClient()
    if (!supabase) {
      toast.error('Supabase client not initialized')
      setLoading(false)
      return
    }

    try {
      // Test 1: Connection
      await testConnection(supabase)

      // Test 2: Units (Read)
      await testUnitsRead(supabase)

      // Test 3: Leads (Read)
      await testLeadsRead(supabase)

      // Test 5: Sales (Read)
      await testSalesRead(supabase)

      // Test 6: Marketing Events (Read)
      await testMarketingEventsRead(supabase)

      // Test 7: Units Realtime
      await testUnitsRealtime(supabase)

      // Test 8: Leads Realtime
      await testLeadsRealtime(supabase)

      // Test 10: Sales Realtime
      await testSalesRealtime(supabase)

      toast.success('Smoke test completed!')
    } catch (error) {
      console.error('Test error:', error)
      toast.error('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async (supabase: any) => {
    const start = Date.now()
    try {
      // Retry logic untuk session
      let session = null
      for (let i = 0; i < 3; i++) {
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session?.user) {
          session = sessionData.session.user
          break
        }
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const duration = Date.now() - start
      if (session) {
        addResult('Supabase Connection', 'pass', 'Connected as: ' + session.email, duration)
      } else {
        addResult('Supabase Connection', 'fail', 'No session found after retry', duration)
      }
    } catch (error) {
      const duration = Date.now() - start
      addResult('Supabase Connection', 'fail', String(error), duration)
    }
  }

  const testUnitsRead = async (supabase: any) => {
    const start = Date.now()
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .limit(1)

      const duration = Date.now() - start
      if (error) throw error
      addResult('Units Read', 'pass', `Found ${data?.length || 0} unit(s)`, duration)
    } catch (error) {
      const duration = Date.now() - start
      addResult('Units Read', 'fail', String(error), duration)
    }
  }

  const testLeadsRead = async (supabase: any) => {
    const start = Date.now()
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .limit(1)

      const duration = Date.now() - start
      if (error) throw error
      addResult('Leads Read', 'pass', `Found ${data?.length || 0} lead(s)`, duration)
    } catch (error) {
      const duration = Date.now() - start
      addResult('Leads Read', 'fail', String(error), duration)
    }
  }

  const testSalesRead = async (supabase: any) => {
    const start = Date.now()
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .limit(1)

      const duration = Date.now() - start
      if (error) throw error
      addResult('Sales Read', 'pass', `Found ${data?.length || 0} sale(s)`, duration)
    } catch (error) {
      const duration = Date.now() - start
      addResult('Sales Read', 'fail', String(error), duration)
    }
  }

  const testMarketingEventsRead = async (supabase: any) => {
    const start = Date.now()
    try {
      const { data, error } = await supabase
        .from('marketing_events')
        .select('*')
        .limit(1)

      const duration = Date.now() - start
      if (error) throw error
      addResult('Marketing Events Read', 'pass', `Found ${data?.length || 0} event(s)`, duration)
    } catch (error) {
      const duration = Date.now() - start
      addResult('Marketing Events Read', 'fail', String(error), duration)
    }
  }

  const testUnitsRealtime = async (supabase: any) => {
    const start = Date.now()
    return new Promise<void>((resolve) => {
      let received = false
      let timeout: NodeJS.Timeout

      const subscription = supabase
        .channel('units-test')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, () => {
          received = true
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            timeout = setTimeout(() => {
              const duration = Date.now() - start
              addResult('Units Realtime', 'pass', 'Subscription active', duration)
              subscription.unsubscribe()
              resolve()
            }, 1000)
          }
        })

      // Force timeout after 5 seconds
      setTimeout(() => {
        clearTimeout(timeout)
        const duration = Date.now() - start
        addResult('Units Realtime', 'fail', 'Subscription timeout', duration)
        subscription.unsubscribe()
        resolve()
      }, 5000)
    })
  }

  const testLeadsRealtime = async (supabase: any) => {
    const start = Date.now()
    return new Promise<void>((resolve) => {
      let received = false
      let timeout: NodeJS.Timeout

      const subscription = supabase
        .channel('leads-test')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
          received = true
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            timeout = setTimeout(() => {
              const duration = Date.now() - start
              addResult('Leads Realtime', 'pass', 'Subscription active', duration)
              subscription.unsubscribe()
              resolve()
            }, 1000)
          }
        })

      // Force timeout after 5 seconds
      setTimeout(() => {
        clearTimeout(timeout)
        const duration = Date.now() - start
        addResult('Leads Realtime', 'fail', 'Subscription timeout', duration)
        subscription.unsubscribe()
        resolve()
      }, 5000)
    })
  }

  const testSalesRealtime = async (supabase: any) => {
    const start = Date.now()
    return new Promise<void>((resolve) => {
      let received = false
      let timeout: NodeJS.Timeout

      const subscription = supabase
        .channel('sales-test')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
          received = true
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            timeout = setTimeout(() => {
              const duration = Date.now() - start
              addResult('Sales Realtime', 'pass', 'Subscription active', duration)
              subscription.unsubscribe()
              resolve()
            }, 1000)
          }
        })

      // Force timeout after 5 seconds
      setTimeout(() => {
        clearTimeout(timeout)
        const duration = Date.now() - start
        addResult('Sales Realtime', 'fail', 'Subscription timeout', duration)
        subscription.unsubscribe()
        resolve()
      }, 5000)
    })
  }

  const passCount = results.filter((r) => r.status === 'pass').length
  const failCount = results.filter((r) => r.status === 'fail').length
  const totalTime = loading ? 0 : Date.now() - testStart

  if (!authorized) {
    return null
  }

  return (
    <div 
      className="min-h-screen p-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/bg-smoke-test.jpg)' }}
    >
      {/* Overlay untuk darkening background */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧪 Smoke Test Dashboard</h1>
          <p className="text-gray-400">Testing all realtime features</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400 font-semibold">PASSED</p>
            <p className="text-2xl font-bold text-white">{results.length > 0 ? passCount : '-'}</p>
          </div>
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 font-semibold">FAILED</p>
            <p className="text-2xl font-bold text-white">{results.length > 0 ? failCount : '-'}</p>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <p className="text-blue-400 font-semibold">TOTAL TIME</p>
            <p className="text-2xl font-bold text-white">{totalTime}ms</p>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/20 border-b border-white/20">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-white">Test Name</th>
                <th className="text-left px-6 py-4 font-semibold text-white">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-white">Message</th>
                <th className="text-right px-6 py-4 font-semibold text-white">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {results.map((result, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 text-white">{result.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        result.status === 'pass'
                          ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                          : 'bg-red-500/20 text-red-300 border border-red-500/50'
                      }`}
                    >
                      {result.status === 'pass' ? '✅ PASS' : '❌ FAIL'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{result.message}</td>
                  <td className="px-6 py-4 text-right text-gray-300 text-sm">{result.duration}ms</td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
              <span className="ml-4 text-gray-300">Running tests...</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="bg-gold-500 hover:bg-gold-600 disabled:bg-gray-600 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            {loading ? 'Running Tests...' : 'Run Tests Again'}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-500/20 border border-blue-500/50 rounded-lg p-6">
          <h3 className="text-blue-300 font-semibold mb-3">Test Instructions</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>✓ Test 1-6: Check if data dapat dibaca dari setiap table</li>
            <li>✓ Test 7-10: Check jika realtime subscription berhasil connect</li>
            <li>✓ Open ini di 2 tab browser dan ubah data di Supabase untuk test realtime</li>
            <li>✓ Harusnya data update otomatis di kedua tab dalam kurang dari 1 detik</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
