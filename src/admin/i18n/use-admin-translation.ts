'use client';

/**
 * Typed wrapper around Payload's `useTranslation()` that widens the `t`
 * function to accept our custom translation keys (see `custom-translations.ts`).
 * Merges DB-driven translations on top of the static file so admin custom
 * components reflect CMS edits at runtime.
 */

import { useTranslation } from '@payloadcms/ui';
import type {
  CustomTranslationKeys,
  CustomTranslations,
} from './custom-translations';
import { useDbTranslations, lookupDbTranslation } from '../hooks/use-db-translations';

type OriginalT = ReturnType<typeof useTranslation<CustomTranslations, CustomTranslationKeys>>['t'];

export function useAdminTranslation() {
  const result = useTranslation<CustomTranslations, CustomTranslationKeys>();
  const { dbTranslations } = useDbTranslations(result.i18n.language);

  const originalT = result.t as OriginalT;

  const mergedT = (
    key: Parameters<OriginalT>[0],
    options?: Parameters<OriginalT>[1],
  ): string => {
    const dbValue = lookupDbTranslation(dbTranslations, key, options as Record<string, string | number> | undefined);
    if (dbValue !== undefined) {
      return dbValue;
    }
    return originalT(key, options);
  };

  // Preserve all other properties from the original hook
  return {
    ...result,
    t: mergedT as OriginalT,
  };
}
