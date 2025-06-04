import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getIcdToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.ICD_CLIENT_ID;
  const clientSecret = process.env.ICD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing ICD_CLIENT_ID or ICD_CLIENT_SECRET in environment');
  }

  const res = await fetch('https://id.who.int/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'icdapi_access',
    }),
  });

  const data = (await res.json()) as TokenResponse;

  if (!res.ok) {
    throw new Error(`Token fetch failed: ${JSON.stringify(data)}`);
  }

  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in - 60) * 1000;

  return cachedToken;
}