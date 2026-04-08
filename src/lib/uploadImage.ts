// src/lib/uploadImage.ts
import { supabase } from './supabase'

export async function uploadImage(file: File) {
  const fileName = Date.now() + '-' + file.name

  const { error } = await supabase.storage
    .from('analysis-images')
    .upload(fileName, file)

  if (error) {
    console.error("Upload error", error)
    throw error
  }

  const { data } = supabase.storage
    .from('analysis-images')
    .getPublicUrl(fileName)

  return data.publicUrl
} // <-- This was the missing bracket!
