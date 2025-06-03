import Fastify from 'fastify';
import { getIcdToken } from '../icdClient';
import fetch from 'node-fetch';

const fastify = Fastify();

// Register route
fastify.get('/api/icd/search', async (request, reply) => {
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

// ❗ Tidak perlu .listen()
// ❗ Tapi Fastify perlu diinisialisasi hanya sekali

let initialized = false;
async function ensureReady() {
  if (!initialized) {
    await fastify.ready();
    initialized = true;
  }
}

export default async function handler(req: any, res: any) {
  await ensureReady();
  fastify.server.emit('request', req, res);
}