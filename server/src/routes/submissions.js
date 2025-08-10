import { Router } from 'express';
const router = Router();

// POST /submissions/start -> starts (or upserts) user's submission for active assessment
router.post('/start', async (req, res) => {
  const supabase = req.supabase;
  const userId = req.user.id;

  const { data: active, error: actErr } = await supabase
    .from('active_assessment')
    .select('*')
    .maybeSingle();
  if (actErr || !active) return res.status(400).json({ error: 'No active assessment' });

  // try to insert; if exists, select
  const { data: inserted, error: insErr } = await supabase
    .from('submissions')
    .insert({ assessment_id: active.id, user_id: userId, status: 'in_progress' })
    .select('*')
    .maybeSingle();

  if (insErr && !insErr.message.includes('duplicate key')) {
    return res.status(400).json({ error: insErr.message });
  }

  if (inserted) return res.json(inserted);

  const { data: existing, error: exErr } = await supabase
    .from('submissions')
    .select('*')
    .eq('assessment_id', active.id)
    .eq('user_id', userId)
    .single();

  if (exErr) return res.status(400).json({ error: exErr.message });
  res.json(existing);
});

// POST /submissions/complete -> marks submission complete
router.post('/complete', async (req, res) => {
  const supabase = req.supabase;
  const userId = req.user.id;

  const { data: active, error: actErr } = await supabase
    .from('active_assessment')
    .select('*')
    .maybeSingle();
  if (actErr || !active) return res.status(400).json({ error: 'No active assessment' });

  const { data, error } = await supabase
    .from('submissions')
    .update({ status: 'complete', completed_at: new Date().toISOString() })
    .eq('assessment_id', active.id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
