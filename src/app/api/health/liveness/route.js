import { NextResponse } from 'next/server';

const START_TIME = Date.now();

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'bpfquest',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
      environment: process.env.NODE_ENV || 'development',
    },
    { status: 200 }
  );
}
