import 'dotenv/config';

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

  const res = await fetch('https://icdaccessmanagement.who.int/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.ICD_CLIENT_ID!,
      client_secret: process.env.ICD_CLIENT_SECRET!,
      scope: 'icdapi_access',
    }),
  });

  const text = await res.text();

  if (!res.ok) {
  throw new Error(`Token fetch failed (${res.status}): ${text}`);
  }

  let data: TokenResponse;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse token response as JSON: ${text}`);
  }

  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in - 60) * 1000;

  return cachedToken;
}