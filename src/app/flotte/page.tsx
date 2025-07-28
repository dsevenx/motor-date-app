"use client"

import React from 'react';
import { PageTemplate } from '@/components/PageTemplate';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function FlottePage() {

  return (
    <PageTemplate title="Flotte" enableSectionNavigation>
      <div className="space-y-8">
        <section id="allgemein">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Allgemein</h2>
          <p className="text-gray-600">Allgemeine Flottenangaben werden hier angezeigt.</p>
        </section>

        <hr className="border-gray-200" />

        <section id="handel-handwerk">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Handel/Handwerk</h2>
          <p className="text-gray-600">Handel/Handwerk-Flottenangaben werden hier angezeigt.</p>
        </section>
      </div>
    </PageTemplate>
  );
}