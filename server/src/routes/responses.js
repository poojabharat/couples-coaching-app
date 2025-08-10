import { Router } from 'express';
const router = Router();

// POST /responses/batch
// body: { responses: [{ question_id, value_numeric?, value_text? }] }
router.post('/batch', async (req, res) => {
  const supabase = req.supabase;
  const userId = req.user.id;
  const { responses } = req.body || {};

  if (!Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ error: 'responses[] required' });
  }

  // Get active assessment + user's submission id
  const { data: active, error: actErr } = await supabase
    .from('active_assessment')
    .select('*')
    .maybeSingle();
  if (actErr || !active) return res.status(400).json({ error: 'No active assessment' });

  const { data: submission, error: subErr } = await supabase
    .from('submissions')
    .select('id')
    .eq('assessment_id', active.id)
    .eq('user_id', userId)
    .single();
  if (subErr || !submission) return res.status(400).json({ error: 'Start submission first' });

  // Prepare rows
  const rows = responses.map(r => ({
    assessment_id: active.id,
    submission_id: submission.id,
    question_id: r.question_id,
    user_id: userId,
    value_numeric: r.value_numeric ?? null,
    value_text: r.value_text ?? null,
  }));

  // Upsert-like: try insert; on conflict update
  // Supabase v2: use upsert with unique (submission_id, question_id)
  const { data, error } = await supabase
    .from('responses')
    .upsert(rows, { onConflict: 'submission_id,question_id' })
    .select('*');

  if (error) return res.status(400).json({ error: error.message });
  res.json({ count: data.length });
});

export default router;
