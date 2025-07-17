import { createClient } from "@supabase/supabase-js"

// Cliente Supabase para uso no lado do cliente (browser)
// Deve usar as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
// para serem acessíveis no browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são necessárias.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Para uso em Server Components ou Route Handlers, você pode criar um cliente diferente
// que usa a service role key, mas para este caso, o cliente público é suficiente
// para operações de leitura/escrita que serão protegidas por RLS.
// Exemplo (se necessário para Server Actions/APIs):
/*
import { createClient as createServerClient } from '@supabase/supabase-js'
export const supabaseAdmin = createServerClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
*/
