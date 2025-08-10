import { Router } from 'express'
import { composePlan } from '../services/plan.js'

const router = Router()

// POST /plan/generate { couple_id }
// requires the requester to be a member of the couple (enforced by get_couple_report via RPC later)
router.post('/generate', async (req, res) => {
  try {
    const supabase = req.supabase
    const { couple_id } = req.body || {}
    if (!couple_id) return res.status(400).json({ error: 'couple_id required' })

    // Use active assessment id
    const { data: active, error: actErr } = await supabase
      .from('active_assessment').select('*').maybeSingle()
    if (actErr || !active) return res.status(400).json({ error: 'No active assessment' })

    // Ensure report is available (both completed) using existing RPC to leverage RLS
    const { data: report, error: repErr } = await supabase.rpc('get_couple_report', { p_couple_id: couple_id })
    if (repErr) return res.status(400).json({ error: repErr.message })

    const plan = await composePlan(supabase, couple_id, active.id)
    res.json({ report, ...plan })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to generate plan' })
  }
})

export default router
