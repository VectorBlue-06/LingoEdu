import { supabase } from './supabaseClient'

export async function createText({ title, content, language, classroom_code }) {
  const row = { title, content, language }
  if (classroom_code) row.classroom_code = classroom_code

  const { data, error } = await supabase
    .from('texts')
    .insert([row])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function listTexts(classroomCode) {
  let query = supabase
    .from('texts')
    .select('id, title, language, created_at, classroom_code')
    .order('created_at', { ascending: false })

  if (classroomCode) {
    query = query.eq('classroom_code', classroomCode)
  }

  const { data, error } = await query

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

