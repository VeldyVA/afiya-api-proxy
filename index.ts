import Fastify from 'fastify';
import { getIcdToken } from './icdClient';
import fetch from 'node-fetch';

const fastify = Fastify();

fastify.get('/icd/search', async (request, reply) => {
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

fastify.listen({ port: 3000, host: '127.0.0.1' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Proxy API running at ${address}`);
});