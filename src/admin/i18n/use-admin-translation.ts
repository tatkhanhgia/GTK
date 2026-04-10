'use client';

/**
 * Typed wrapper around Payload's `useTranslation()` that widens the `t`
 * function to accept our custom translation keys (see `custom-translations.ts`).
 *
 * Why a wrapper: Payload's `useTranslation<TAdditionalTranslations, TAdditionalKeys>()`
 * is generic, but passing the generics at every call site bloats the components
 * with types that duplicate the same shape. A small hook keeps the call sites
 * clean while still giving us autocompletion on custom keys.
 */

import { useTranslation } from '@payloadcms/ui';
import type {
  CustomTranslationKeys,
  CustomTranslations,
} from './custom-translations';

export function useAdminTranslation() {
  return useTranslation<CustomTranslations, CustomTranslationKeys>();
}
