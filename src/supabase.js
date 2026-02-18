import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nserabncwanazhzaxiyj.supabase.co'
const supabaseKey = 'sb_publishable_hyR5swdybEoS9aFrNPaUjA_Tx_gL3FF'

export const supabase = createClient(supabaseUrl, supabaseKey)