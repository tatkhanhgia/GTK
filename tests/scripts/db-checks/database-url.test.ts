import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const {
  requireRecreatableTestDatabaseName,
} = require('../../../scripts/db-checks/database-url.js')

describe('database-url db check guards', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.CONFIRM_RECREATE_TEST_DATABASE_NAME
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('allows destructive recreation for matching _test database names', () => {
    process.env.TEST_DATABASE_NAME = 'gtkblog_test'

    expect(
      requireRecreatableTestDatabaseName('postgresql://user:pass@localhost:5432/gtkblog_test')
    ).toBe('gtkblog_test')
  })

  it('rejects destructive recreation when a real database name is misconfigured', () => {
    process.env.TEST_DATABASE_NAME = 'gtkblog'

    expect(() =>
      requireRecreatableTestDatabaseName('postgresql://user:pass@localhost:5432/gtkblog')
    ).toThrow('Refusing to recreate database without a _test suffix')
  })

  it('allows explicit exact-name confirmation for nonstandard test database names', () => {
    process.env.TEST_DATABASE_NAME = 'gtkblog_ci'
    process.env.CONFIRM_RECREATE_TEST_DATABASE_NAME = 'gtkblog_ci'

    expect(
      requireRecreatableTestDatabaseName('postgresql://user:pass@localhost:5432/gtkblog_ci')
    ).toBe('gtkblog_ci')
  })
})
