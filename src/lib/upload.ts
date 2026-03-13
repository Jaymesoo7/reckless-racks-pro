import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const uploadScreenshot = async (file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `public/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('screenshots')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('screenshots').getPublicUrl(filePath)
  return data.publicUrl
}
