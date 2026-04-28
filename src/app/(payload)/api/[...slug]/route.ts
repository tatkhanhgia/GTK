import { REST_DELETE, REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'
import config from '@payload-config'
import type { SanitizedConfig } from 'payload'

type ConfigExport = SanitizedConfig | { default: SanitizedConfig }

const serverConfig = Promise.resolve(config as unknown as ConfigExport).then((resolvedConfig) =>
  'default' in resolvedConfig ? resolvedConfig.default : resolvedConfig,
)

export const GET = REST_GET(serverConfig)
export const POST = REST_POST(serverConfig)
export const PATCH = REST_PATCH(serverConfig)
export const DELETE = REST_DELETE(serverConfig)
