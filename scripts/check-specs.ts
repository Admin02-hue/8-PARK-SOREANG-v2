import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const envPath = join(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim()
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...valueParts] = trimmedLine.split('=')
    const value = valueParts.join('=').replace(/^"/, '').replace(/"$/, '')
    if (key) {
      envVars[key.trim()] = value
    }
  }
})

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || ''
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSpecs() {
  try {
    const { data: units, error } = await supabase
      .from('units')
      .select('code, blok, tipe, spesifikasi')
      .or('code.ilike.A%,code.ilike.B%')
      .limit(3)

    if (error) {
      console.error('Error:', error)
    } else {
      console.log('Sample units from database:')
      units?.forEach(unit => {
        console.log(`\n${unit.code} (${unit.blok}):`)
        console.log('Spesifikasi:', JSON.stringify(unit.spesifikasi, null, 2))
      })
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

checkSpecs()
