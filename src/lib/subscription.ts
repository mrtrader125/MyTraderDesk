import { supabase } from './supabase'

export async function activatePremium(userId: string){

await supabase
.from('profiles')
.update({
plan:'premium',
forex_access:true,
gold_access:true
})
.eq('id',userId)

}
