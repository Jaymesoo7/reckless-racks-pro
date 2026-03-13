import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const uploadScreenshot = async (file: File) => {
  // This cleans the filename so iPhones don't cause errors
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('screenshots')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('screenshots').getPublicUrl(filePath)
  return data.publicUrl
}
