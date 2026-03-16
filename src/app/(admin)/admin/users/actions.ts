'use server'
import { createClient } from '@supabase/supabase-js'

export async function getAdminUsers() {
  // Initialize Supabase in "God Mode" using the Service Role Key
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch directly from the hidden auth database, guaranteeing we see every registered user
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()

  if (error) {
    console.error('Error fetching admin users:', error)
    return []
  }

  // Format the raw auth data so it perfectly matches your beautiful UI table
  return data.users.map(user => ({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || 'Unknown Operator',
    plan: user.app_metadata?.plan || user.user_metadata?.plan || 'BASIC',
    status: user.user_metadata?.status || 'ACTIVE',
    created_at: user.created_at,
    renewal_date: null
  }))
}
