/**
 * UUID Utilities
 * ==============
 * Generate dan validasi UUID v4
 */

/**
 * Generate UUID v4 yang valid
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Validasi apakah string adalah UUID yang valid
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Get atau generate admin UUID
 * Simpan di localStorage agar tetap konsisten
 */
export function getOrCreateAdminUUID(): string {
  if (typeof window === 'undefined') {
    // Server side - generate baru saja
    return generateUUID()
  }

  const stored = localStorage.getItem('admin_uuid')
  if (stored && isValidUUID(stored)) {
    return stored
  }

  const newUUID = generateUUID()
  localStorage.setItem('admin_uuid', newUUID)
  return newUUID
}
