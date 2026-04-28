import { RootPage } from '@payloadcms/next/views'
import { importMap } from '../../importMap'
import config from '@payload-config'
import type { SanitizedConfig } from 'payload'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

type ConfigExport = SanitizedConfig | { default: SanitizedConfig }

const serverConfig = Promise.resolve(config as unknown as ConfigExport).then((resolvedConfig) =>
  'default' in resolvedConfig ? resolvedConfig.default : resolvedConfig,
)

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config: serverConfig, importMap, params, searchParams })

export default Page
