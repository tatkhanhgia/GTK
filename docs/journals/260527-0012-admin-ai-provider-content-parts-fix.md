# Admin AI Provider Content Parts Fix

## Summary
- Fixed Admin AI chat adapter dropping non-string provider `message.content`.
- Added support for text content parts from OpenAI-compatible providers.
- Added API guard so truly empty provider replies return a clear 502 error instead of persisting/displaying a generic acknowledgement.
- Follow-up log investigation found local profile `http://localhost:1234` was normalized to `/chat/completions`; provider requires `/v1/chat/completions` and returned a 200 body with an error field.
- Updated URL normalization and provider error detection so the local Agent call reaches the correct endpoint and surfaces provider errors.

## Validation
- `npm test -- tests/lib/admin-ai/openai-compatible-client.test.ts tests/api/admin-ai-chat.test.ts`
- `npx tsc --noEmit`
- Direct local provider probe: `http://localhost:1234/v1/chat/completions` returned `content: "ok"` for profile `Local`.
- `npm test`
- `npm run lint`

## Unresolved Questions
- None.
