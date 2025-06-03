import { getIcdToken } from '../../icdClient';
import fetch from 'node-fetch';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = req.query.q as string;
  if (!q) {
    return res.status(400).json({ error: 'Missing query param: q' });
  }

  try {
    const token = await getIcdToken();
    const result = await fetch(
      `https://id.who.int/icd/release/11/2024-01/mms/search?q=${encodeURIComponent(q)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    const data = await result.json();
    res.status(result.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}