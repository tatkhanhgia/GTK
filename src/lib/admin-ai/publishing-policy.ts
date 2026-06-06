import { normalizeSourceLedger, hasAdequateSources, type SourceLedgerEntry } from './tools/source-ledger-utils'

export type PublishingPolicyInput = {
  contentType: 'post' | 'page'
  action: 'create_draft' | 'publish' | 'schedule' | 'seo_update'
  changeKind?: 'new_long_form' | 'refresh_approved_content' | 'translation_from_approved_source' | 'typo_fix'
  requestedAutoPublish?: boolean
  sourceLedger?: unknown
  verifiedSourceLedger?: unknown
  text?: unknown
}

export type PublishingPolicyResult = {
  tier: 'low' | 'medium' | 'high' | 'blocked'
  decision: 'auto_allowed' | 'confirmation_required' | 'blocked'
  reasons: string[]
  sourceLedger: SourceLedgerEntry[]
}

const HIGH_RISK_TERMS = [
  'medical advice',
  'legal advice',
  'financial advice',
  'investment advice',
  'security vulnerability',
  'credential',
  'password',
  'private key',
]

const LOW_RISK_CHANGE_KINDS = [
  'refresh_approved_content',
  'translation_from_approved_source',
  'typo_fix',
]

function containsHighRiskTerm(text: string) {
  const lower = text.toLowerCase()
  return HIGH_RISK_TERMS.some((term) => lower.includes(term))
}

export function evaluatePublishingPolicy(input: PublishingPolicyInput): PublishingPolicyResult {
  const sourceLedger = normalizeSourceLedger(input.sourceLedger)
  const trustedSourceLedger = input.action === 'create_draft'
    ? sourceLedger
    : normalizeSourceLedger(input.verifiedSourceLedger)
  const reasons: string[] = []
  const text = typeof input.text === 'string' ? input.text : ''

  if (containsHighRiskTerm(text)) {
    return {
      tier: 'blocked',
      decision: 'blocked',
      reasons: ['High-risk or sensitive content requires manual editorial handling outside auto-publish tools.'],
      sourceLedger: trustedSourceLedger,
    }
  }

  if ((input.action === 'publish' || input.action === 'schedule') && !hasAdequateSources(trustedSourceLedger)) {
    reasons.push('Publish/schedule needs at least one verified medium/high-confidence source summary.')
  }

  if (input.action === 'create_draft') {
    return {
      tier: input.changeKind === 'new_long_form' ? 'medium' : 'low',
      decision: 'confirmation_required',
      reasons: ['Draft creation stays confirmation-gated in Admin AI.'],
      sourceLedger,
    }
  }

  const lowRisk = Boolean(input.changeKind && LOW_RISK_CHANGE_KINDS.includes(input.changeKind))
  if (input.requestedAutoPublish && lowRisk && reasons.length === 0) {
    return {
      tier: 'low',
      decision: 'auto_allowed',
      reasons: [`Low-risk ${input.changeKind} passes source checks.`],
      sourceLedger: trustedSourceLedger,
    }
  }

  if (reasons.length > 0) {
    return { tier: 'blocked', decision: 'blocked', reasons, sourceLedger: trustedSourceLedger }
  }

  return {
    tier: lowRisk ? 'low' : 'medium',
    decision: 'confirmation_required',
    reasons: ['Admin approval required for this web CMS publish action.'],
    sourceLedger: trustedSourceLedger,
  }
}
