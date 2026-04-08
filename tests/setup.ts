// Extend Vitest's `expect` with @testing-library/jest-dom matchers
// (e.g. `toBeInTheDocument`, `toHaveTextContent`). Importing the dedicated
// `/vitest` entry point both registers the matchers at runtime AND augments
// Vitest's `Assertion` interface with the proper TypeScript types.
import '@testing-library/jest-dom/vitest'

// Mock environment variables for tests
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock'
process.env.SEPAY_WEBHOOK_SECRET = 'sepay_test_secret'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.PAYLOAD_SECRET = 'test-secret-32-chars-long-enough'
process.env.RESEND_API_KEY = 're_test_mock'
