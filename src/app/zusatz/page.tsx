"use client"

import React from 'react';
import { PageTemplate } from '@/components/PageTemplate';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function ZusatzPage() {

  return (
    <PageTemplate title="Zusatz" enableSectionNavigation>
      <div className="space-y-8">
        <section id="allgemein">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Allgemein</h2>
          <p className="text-gray-600">Allgemeine Zusatzangaben werden hier angezeigt.</p>
        </section>

        <hr className="border-gray-200" />

        <section id="ivf">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">IVF</h2>
          <p className="text-gray-600">IVF-Zusatzangaben werden hier angezeigt.</p>
        </section>

        <hr className="border-gray-200" />

        <section id="automotive">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Automotive</h2>
          <p className="text-gray-600">Automotive-Zusatzangaben werden hier angezeigt.</p>
        </section>
      </div>
    </PageTemplate>
  );
}