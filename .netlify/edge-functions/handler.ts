/*
 * Netlify Edge Functions Router untuk Next.js
 * ============================================
 * File ini mengarahkan semua request ke Next.js handler
 */

export default async (request) => {
  // Proxy semua request ke Next.js
  return new Response('Not Found', { status: 404 })
}
