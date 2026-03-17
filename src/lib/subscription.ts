import { supabase } from './supabase'

export async function activatePremium(userId: string){

await supabase
.from('profiles')
.update({
plan:'pro',
forex_access:true,
gold_access:true
})
.eq('id',userId)

}
