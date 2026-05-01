import { supabase } from '@/lib/supabase'

export async function enqueueDeferredEvent(event: any) {
  await supabase.from('deferred_events').insert(event)
}
