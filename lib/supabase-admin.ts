// lib/supabase-admin.ts
// Used SERVER-SIDE ONLY (API routes / Server Actions)
// Never import this in client components!

import { createClient } from "@supabase/supabase-js"

// Service role key — keep secret, never expose to browser
const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})