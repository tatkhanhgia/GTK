import { getAuth } from '@/lib/auth/auth-config'
import { toNextJsHandler } from 'better-auth/next-js'

const handler = toNextJsHandler(getAuth())

export const { GET, POST } = handler
