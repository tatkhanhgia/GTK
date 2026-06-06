import { describe, expect, it } from 'vitest'
import { evaluatePublishingPolicy } from '@/lib/admin-ai/publishing-policy'

const supportedSource = [{
  kind: 'existing-post',
  title: 'Approved source',
  summary: 'Existing approved content provides enough source support for this narrow update.',
  confidence: 'high',
}]

describe('content publishing policy', () => {
  it('allows only narrow low-risk auto-publish cases', () => {
    expect(evaluatePublishingPolicy({
      contentType: 'post',
      action: 'publish',
      requestedAutoPublish: true,
      changeKind: 'typo_fix',
      sourceLedger: supportedSource,
      verifiedSourceLedger: supportedSource,
    })).toMatchObject({ tier: 'low', decision: 'auto_allowed' })
  })

  it('requires approval for new long-form publish even with sources', () => {
    expect(evaluatePublishingPolicy({
      contentType: 'post',
      action: 'publish',
      changeKind: 'new_long_form',
      sourceLedger: supportedSource,
      verifiedSourceLedger: supportedSource,
    })).toMatchObject({ tier: 'medium', decision: 'confirmation_required' })
  })

  it('blocks publishing when source support is missing', () => {
    expect(evaluatePublishingPolicy({
      contentType: 'page',
      action: 'schedule',
      changeKind: 'new_long_form',
      sourceLedger: [],
    })).toMatchObject({ tier: 'blocked', decision: 'blocked' })
  })
})
