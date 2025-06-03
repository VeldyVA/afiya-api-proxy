interface TokenResponse {
  access_token: string;
  expires_in: number;
}

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getIcdToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  const res = await fetch('https://id.who.int/oauth2/token', {
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

  const data = (await res.json()) as Partial<TokenResponse>;

if (!data.access_token || !data.expires_in) {
  throw new Error(`Invalid token response: ${JSON.stringify(data)}`);
}

  if (!res.ok) {
  throw new Error(`Token fetch failed: ${JSON.stringify(data)}`);
}

cachedToken = data.access_token;
tokenExpiry = now + (data.expires_in - 60) * 1000; // refresh 1 minute before expiry

return cachedToken as string;
}