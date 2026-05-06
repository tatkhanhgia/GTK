import { NextResponse } from 'next/server'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

type HealthResponse = {
  ok: boolean
  database: 'ok' | 'error'
  version: string
}

function getVersion() {
  return process.env.GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_GIT_COMMIT_SHA || 'unknown'
}

export async function GET() {
  const connectionString = process.env.DATABASE_URL
  const version = getVersion()

  if (!connectionString) {
    return NextResponse.json<HealthResponse>(
      { ok: false, database: 'error', version },
      { status: 503 },
    )
  }

  const sql = postgres(connectionString, { max: 1, idle_timeout: 1, connect_timeout: 5 })

  try {
    await sql`SELECT 1`
    return NextResponse.json<HealthResponse>({ ok: true, database: 'ok', version })
  } catch {
    return NextResponse.json<HealthResponse>(
      { ok: false, database: 'error', version },
      { status: 503 },
    )
  } finally {
    await sql.end({ timeout: 1 })
  }
}
