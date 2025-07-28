"use client"

import React from 'react';
import { PageTemplate } from '@/components/PageTemplate';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function VertragPage() {

  return (
    <PageTemplate title="Vertrag" enableSectionNavigation>
      <div className="space-y-8">
        <section id="aktivitaetensteuerung">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Aktivitätensteuerung</h2>
          <p className="text-gray-600">Aktivitätensteuerung wird hier angezeigt.</p>
        </section>

        <hr className="border-gray-200" />

        <section id="grundlagen">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Grundlagen</h2>
          <p className="text-gray-600">Vertragsgrundlagen werden hier angezeigt.</p>
        </section>
      </div>
    </PageTemplate>
  );
}