"use client"

import React from 'react';
import { PageTemplate } from '@/components/PageTemplate';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function ProduktPage() {

  return (
    <PageTemplate title="Produkt" enableSectionNavigation>
      <div className="space-y-8">
        <section id="liste">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Liste</h2>
          <p className="text-gray-600">Produktliste wird hier angezeigt.</p>
        </section>

        <hr className="border-gray-200" />

        <section id="nachlaesse-zuschlaege">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Nachlässe/Zuschläge</h2>
          <p className="text-gray-600">Nachlässe und Zuschläge werden hier angezeigt.</p>
        </section>

        <hr className="border-gray-200" />

        <section id="fahrer">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Fahrer</h2>
          <p className="text-gray-600">Fahrerangaben werden hier angezeigt.</p>
        </section>

        <hr className="border-gray-200" />

        <section id="merkmale">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Merkmale</h2>
          <p className="text-gray-600">Produktmerkmale werden hier angezeigt.</p>
        </section>

        <hr className="border-gray-200" />

        <section id="tarifangaben">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tarifangaben</h2>
          <p className="text-gray-600">Tarifangaben werden hier angezeigt.</p>
        </section>
      </div>
    </PageTemplate>
  );
}