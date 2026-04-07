'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CustomSidebarClient } from './custom-sidebar-client';

export function SidebarInjector() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Find or create sidebar container
  let container = document.getElementById('custom-sidebar-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'custom-sidebar-container';
    document.body.appendChild(container);
  }

  return createPortal(<CustomSidebarClient />, container);
}
