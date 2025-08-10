import { createClient } from '@supabase/supabase-js';

export function supabaseForToken(token) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    }
  });
  return supabase;
}

// Attaches req.supabase and req.user (with id) if token is valid.
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization Bearer token' });
    }
    const supabase = supabaseForToken(token);
    // Get user from token via /auth/v1/user
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.supabase = supabase;
    req.user = { id: user.id, email: user.email };
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Auth error' });
  }
}
