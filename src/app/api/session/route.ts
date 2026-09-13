import { NextRequest, NextResponse } from 'next/server';
import { getSession, saveSession } from '@/lib/sessionStore';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const session = await getSession(ip);
  return NextResponse.json(session);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const body = await req.json();
  await saveSession(ip, body);
  return NextResponse.json({ ok: true });
}
