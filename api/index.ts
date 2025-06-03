// api/index.ts
import Fastify from 'fastify';
import fetch from 'node-fetch';
import { getIcdToken } from '../icdClient';

const app = Fastify();

// Endpoint ICD Search
app.get('/icd/entity/search', async (request, reply) => {
  const q = (request.query as any).q;
  if (!q) {
    return reply.code(400).send({ error: 'Missing query param: q' });
  }

  const token = await getIcdToken();
  const res = await fetch(`https://id.who.int/icd/release/11/2024-01/mms/search?q=${encodeURIComponent(q)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const data = await res.json();
  return data;
});

// Adapter untuk Vercel
const start = app.ready().then(() => {
  return async (req: any, res: any) => {
    app.server.emit('request', req, res);
  };
});

export default start;