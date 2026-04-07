import React from 'react';
import { AdminThemeProviderClient } from './admin-theme-provider-client';

export function AdminThemeProvider({ children }: { children?: React.ReactNode }) {
  return <AdminThemeProviderClient>{children}</AdminThemeProviderClient>;
}
