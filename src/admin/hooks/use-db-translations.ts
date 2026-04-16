'use client';

import { useEffect, useState } from 'react';

export type NestedTranslations = Record<string, unknown>;

// Module-level promise cache deduplicates concurrent fetches for the same locale
const fetchPromises = new Map<string, Promise<NestedTranslations>>();

async function fetchTranslations(locale: string): Promise<NestedTranslations> {
  const cacheKey = locale;
  const existing = fetchPromises.get(cacheKey);
  if (existing) return existing;

  const promise = fetch(`/api/translations?locale=${locale}`, { credentials: 'include' })
    .then((res) => (res.ok ? res.json() : {}))
    .catch(() => ({}))
    .finally(() => {
      fetchPromises.delete(cacheKey);
    });

  fetchPromises.set(cacheKey, promise);
  return promise;
}

export function useDbTranslations(locale: string) {
  const [dbTranslations, setDbTranslations] = useState<NestedTranslations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchTranslations(locale)
      .then((data) => {
        if (isMounted) {
          setDbTranslations(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDbTranslations({});
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [locale]);

  return { dbTranslations, isLoading };
}

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = vars[key];
    return value !== undefined && value !== null ? String(value) : '';
  });
}

const POLLUTING_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function lookupDbTranslation(
  dbTranslations: NestedTranslations,
  key: string,
  vars?: Record<string, string | number>,
): string | undefined {
  const parts = key.split(':');
  let current: unknown = dbTranslations;

  for (const part of parts) {
    if (POLLUTING_KEYS.has(part)) return undefined;
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current === 'string') {
    return interpolate(current, vars);
  }

  return undefined;
}
