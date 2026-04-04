// Custom table schemas — defined here, used via payload.db.drizzle at runtime
// IMPORTANT: Do NOT create a separate DB connection. Access Drizzle via:
//   const payload = await getPayload({ config })
//   const db = payload.db.drizzle

export * from './schema'
