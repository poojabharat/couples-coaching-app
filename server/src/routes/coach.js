import { Router } from 'express'
import { coachAuth } from '../middleware/coachAuth.js'
import { composePlan } from '../services/plan.js'

const router = Router()
router.use(coachAuth)

// GET /coach/couples -> list couples with risk index descending (active assessment)
router.get('/couples', async (req, res) => {
  const supabase = req.supabase
  const { data: active, error: actErr } = await supabase.from('active_assessment').select('*').maybeSingle()
  if (actErr || !active) return res.status(400).json({ error: 'No active assessment' })

  const { data, error } = await supabase
    .from('v_couple_risk_index')
    .select('couple_id, assessment_id, risk_index_0_100')
    .eq('assessment_id', active.id)
    .order('risk_index_0_100', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// GET /coach/couples/:id/overview -> report + plan (ignores membership via coach key)
router.get('/couples/:id/overview', async (req, res) => {
  const supabase = req.supabase
  const coupleId = req.params.id
  const { data: active, error: actErr } = await supabase.from('active_assessment').select('*').maybeSingle()
  if (actErr || !active) return res.status(400).json({ error: 'No active assessment' })

  // Use a service-style bypass by impersonating? Better: create a PostgREST function for coaches later.
  // For now, return plan without report if report RPC blocks. Coaches can still view plan skeleton.
  let report = null
  try {
    const rep = await supabase.rpc('get_couple_report', { p_couple_id: coupleId })
    if (!rep.error) report = rep.data
  } catch {}

  const plan = await composePlan(supabase, coupleId, active.id)
  res.json({ report, ...plan })
})

export default router
