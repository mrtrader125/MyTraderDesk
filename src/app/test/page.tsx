'use client'

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function Test(){

useEffect(()=>{

async function checkUser(){

const { data } = await supabase.auth.getUser()

console.log("USER:", data)

}

checkUser()

},[])

return(

<div className="p-10">
Check console for user session
</div>

)

}