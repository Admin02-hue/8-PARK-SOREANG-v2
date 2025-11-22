/**
 * Formatter Utilities
 * ===================
 * 
 * Helper functions untuk formatting data yang ditampilkan di UI
 */

/**
 * Format angka menjadi Rupiah dengan separator
 * Contoh: 897933600 → "Rp 897.933.600"
 */
export function formatRupiah(
  amount: number | string | undefined,
  options: {
    prefix?: string
    suffix?: string
    showDecimal?: boolean
  } = {}
): string {
  if (amount === undefined || amount === null) return '-'

  const {
    prefix = 'Rp ',
    suffix = '',
    showDecimal = false,
  } = options

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) return '-'

  const formatted = showDecimal
    ? numAmount.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : Math.round(numAmount).toLocaleString('id-ID')

  return `${prefix}${formatted}${suffix}`
}

/**
 * Format angka dengan separator (tanpa Rupiah)
 * Contoh: 1234567 → "1.234.567"
 */
export function formatNumber(value: number | string | undefined): string {
  if (value === undefined || value === null) return '-'

  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) return '-'

  return Math.round(numValue).toLocaleString('id-ID')
}

/**
 * Format luas dengan satuan m²
 * Contoh: 65 → "65 m²"
 */
export function formatLuas(value: number | string | undefined): string {
  if (value === undefined || value === null) return '-'

  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) return '-'

  return `${Math.round(numValue)} m²`
}

/**
 * Generate deskripsi unit dari data
 * Format: "Blok A5 · Tipe 65 · Luas Tanah 84 m² · Luas Bangunan 65 m²"
 */
export function generateUnitDescription(unit: {
  code: string
  name: string
  luas_tanah: number
  luas_bangunan: number
}): string {
  const { code, name, luas_tanah, luas_bangunan } = unit

  // Extract tipe dari name (misal "Tipe 65 – Blok A" → "65")
  const tipeMatch = name.match(/[Tt]ipe\s+(\d+)/)
  const tipe = tipeMatch ? tipeMatch[1] : 'Tipe'

  return (
    `Blok ${code} · ` +
    `Tipe ${tipe} · ` +
    `Luas Tanah ${formatLuas(luas_tanah)} · ` +
    `Luas Bangunan ${formatLuas(luas_bangunan)}`
  )
}

/**
 * Generate deskripsi unit dalam bentuk paragraf
 * Format: "Rumah di Blok A5, Tipe 65, dengan luas tanah 84 m² dan luas bangunan 65 m²"
 */
export function generateUnitDescriptionParagraph(unit: {
  code: string
  name: string
  luas_tanah: number
  luas_bangunan: number
}): string {
  const { code, luas_tanah, luas_bangunan } = unit

  // Extract tipe dari name
  const tipeMatch = unit.name.match(/[Tt]ipe\s+(\d+)/)
  const tipe = tipeMatch ? tipeMatch[1] : 'Tipe'

  return (
    `Rumah di Blok ${code}, Tipe ${tipe}, dengan luas tanah ${formatLuas(luas_tanah)} ` +
    `dan luas bangunan ${formatLuas(luas_bangunan)}.`
  )
}

/**
 * Format status unit menjadi text yang user-friendly
 */
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    tersedia: 'Tersedia',
    booking: 'Booking',
    terjual: 'Terjual',
  }

  return statusMap[status.toLowerCase()] || status
}

/**
 * Get color class untuk badge status
 */
export function getStatusColorClass(status: string): string {
  const colorMap: Record<string, string> = {
    tersedia: 'bg-green-100 text-green-800',
    booking: 'bg-yellow-100 text-yellow-800',
    terjual: 'bg-red-100 text-red-800',
  }

  return colorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

/**
 * Format tanggal ke format Indonesia
 * Contoh: "14 November 2025"
 */
export function formatDateID(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]

  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Calculate simulasi KPR sederhana
 * Asumsi: bunga 4,30% per tahun, tenor 20 tahun
 */
export function calculateKPRSimulation(
  price: number,
  downPaymentPercent: number = 10
): {
  downPayment: number
  loanAmount: number
  monthlyPayment: number
  totalPayment: number
} {
  const downPayment = (price * downPaymentPercent) / 100
  const loanAmount = price - downPayment

  // Bunga per bulan = 4,30% per tahun / 12
  const monthlyRate = 0.043 / 12
  const months = 20 * 12 // 20 tahun

  // Rumus: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyPayment =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1)

  const totalPayment = monthlyPayment * months

  return {
    downPayment: Math.round(downPayment),
    loanAmount: Math.round(loanAmount),
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
  }
}
