import { Router } from 'express';
const router = Router();

// POST /consents -> { couple_id, share_with_partner?, share_with_coach?, allow_raw_text? }
router.post('/', async (req, res) => {
  const supabase = req.supabase;
  const userId = req.user.id;
  const { couple_id, share_with_partner, share_with_coach, allow_raw_text } = req.body || {};

  if (!couple_id) return res.status(400).json({ error: 'couple_id required' });

  const payload = {
    couple_id,
    user_id: userId,
    ...(share_with_partner === undefined ? {} : { share_with_partner }),
    ...(share_with_coach === undefined ? {} : { share_with_coach }),
    ...(allow_raw_text === undefined ? {} : { allow_raw_text }),
  };

  // upsert based on unique (couple_id, user_id)
  const { data, error } = await supabase
    .from('consents')
    .upsert(payload, { onConflict: 'couple_id,user_id' })
    .select('*')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
