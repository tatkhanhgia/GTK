import configModule from '../../payload.config.ts'

async function main() {
  const config = await configModule
  console.log('config type:', typeof config)
  console.log('config keys:', Object.keys(config).slice(0, 30))
  console.log('collections:', config.collections?.length)
  console.log('db:', typeof config.db)
}

main()
