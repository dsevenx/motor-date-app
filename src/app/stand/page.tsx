"use client"

import React from 'react';
import { PageTemplate } from '@/components/PageTemplate';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function StandPage() {
  return (
    <PageTemplate title="Stand">
      <p className="text-gray-600">Stand-Seite Inhalt wird hier angezeigt.</p>
    </PageTemplate>
  );
}