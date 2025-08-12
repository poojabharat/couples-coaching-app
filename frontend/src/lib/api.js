import { supabase } from '../supabaseClient'

function baseUrl() {
  return import.meta.env.VITE_API_URL || ''
}

function resolveUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const base = baseUrl()
  return `${base}${path}`
}

export async function authFetchJson(path, opts = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
  const res = await fetch(resolveUrl(path), { ...opts, headers })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json
}

export async function authFetchBlob(path, opts = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = { ...(opts.headers || {}) }
  if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
  const res = await fetch(resolveUrl(path), { ...opts, headers })
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j.error || 'Request failed')
  }
  return res.blob()
}

export async function coachFetchJson(path, coachKey, opts = {}) {
  const headers = { 'x-coach-key': coachKey, ...(opts.headers || {}) }
  const res = await fetch(resolveUrl(path), { ...opts, headers })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json
}

export async function coachFetchBlob(path, coachKey, opts = {}) {
  const headers = { 'x-coach-key': coachKey, ...(opts.headers || {}) }
  const res = await fetch(resolveUrl(path), { ...opts, headers })
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j.error || 'Request failed')
  }
  return res.blob()
}

