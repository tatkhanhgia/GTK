export async function readSiteHealth() {
  return {
    ok: Boolean(process.env.DATABASE_URL),
    database: process.env.DATABASE_URL ? 'configured' : 'missing',
    version: process.env.GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_GIT_COMMIT_SHA || 'unknown',
  }
}
