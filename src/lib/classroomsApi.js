import { supabase } from './supabaseClient'

/* ── Generate a unique 6-char code ── */
function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

/* ── CREATE a classroom (teacher) ── */
export async function createClassroom({ name, teacher_name }) {
  const code = generateCode()
  const { data, error } = await supabase
    .from('classrooms')
    .insert([{ name, code, teacher_name }])
    .select()
    .single()

  if (error) throw error
  return data
}

/* ── LIST classrooms created by a teacher ── */
export async function listTeacherClassrooms(teacherName) {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('teacher_name', teacherName)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/* ── DELETE a classroom ── */
export async function deleteClassroom(id) {
  const { error } = await supabase
    .from('classrooms')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/* ── SEARCH classrooms (students) ── */
export async function searchClassrooms(query) {
  const q = query.trim()
  if (!q) return []

  // Search by code (exact) or name (ilike)
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .or(`code.eq.${q.toUpperCase()},name.ilike.%${q}%`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data ?? []
}

/* ── GET a single classroom by code ── */
export async function getClassroomByCode(code) {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle()

  if (error) throw error
  return data
}

/* ── LIST all classrooms ── */
export async function listAllClassrooms() {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/* ── JOIN a classroom (student) ── */
export async function joinClassroom({ classroom_code, student_name }) {
  // Check if already joined
  const { data: existing } = await supabase
    .from('classroom_members')
    .select('id')
    .eq('classroom_code', classroom_code)
    .eq('student_name', student_name)
    .maybeSingle()

  if (existing) return existing

  const { data, error } = await supabase
    .from('classroom_members')
    .insert([{ classroom_code, student_name }])
    .select()
    .single()

  if (error) throw error
  return data
}

/* ── LEAVE a classroom (student) ── */
export async function leaveClassroom({ classroom_code, student_name }) {
  const { error } = await supabase
    .from('classroom_members')
    .delete()
    .eq('classroom_code', classroom_code)
    .eq('student_name', student_name)

  if (error) throw error
}

/* ── LIST classrooms a student has joined ── */
export async function listJoinedClassrooms(studentName) {
  const { data, error } = await supabase
    .from('classroom_members')
    .select('classroom_code')
    .eq('student_name', studentName)

  if (error) throw error

  if (!data || data.length === 0) return []

  const codes = data.map((d) => d.classroom_code)
  const { data: rooms, error: roomErr } = await supabase
    .from('classrooms')
    .select('*')
    .in('code', codes)

  if (roomErr) throw roomErr
  return rooms ?? []
}
