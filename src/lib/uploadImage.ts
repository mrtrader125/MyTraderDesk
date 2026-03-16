import { supabase } from './supabase'

export async function uploadImage(file: File){

const fileName = Date.now() + '-' + file.name

const { error } = await supabase.storage
.from('analysis-images')
.upload(fileName, file)

if(error){
console.error(error)
throw new Error("Image upload failed")
}

const { data } = supabase.storage
.from('analysis-images')
.getPublicUrl(fileName)

return data.publicUrl
}