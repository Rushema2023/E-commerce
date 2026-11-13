import { createClient } from '@supabase/supabase-js'

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required server environment variable: ${name}`)
  return value
}

export function serviceSupabase() {
  return createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function requireUserId(authorization?: string) {
  const token = authorization?.replace(/^Bearer\s+/i, '').trim()
  if (!token) throw new Error('Authentication is required')

  const { data, error } = await serviceSupabase().auth.getUser(token)
  if (error || !data.user) throw new Error('Your session is invalid or has expired')
  return data.user.id
}

export async function requireAdmin(authorization?: string) {
  const userId = await requireUserId(authorization)
  const { data, error } = await serviceSupabase()
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()
  if (error || !data?.is_admin) throw new Error('Administrator access is required')
  return userId
}
