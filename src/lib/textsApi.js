import { supabase } from './supabaseClient'

export async function createText({ title, content, language }) {
  const { data, error } = await supabase
    .from('texts')
    .insert([{ title, content, language }])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function listTexts() {
  const { data, error } = await supabase
    .from('texts')
    .select('id, title, language, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function getTextById(id) {
  const { data, error } = await supabase
    .from('texts')
    .select('id, title, language, content, created_at')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}

