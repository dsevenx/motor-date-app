"use client"

import React from 'react';
import { PageTemplate } from '@/components/PageTemplate';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function ObjektPage() {

  return (
    <PageTemplate title="Objekt" enableSectionNavigation>
      <div className="space-y-8">
        <section id="stamm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Stamm</h2>
          <p className="text-gray-600">Stammdaten des Objekts werden hier angezeigt.</p>
        </section>

        <hr className="border-gray-200" />

        <section id="detail">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Detail</h2>
          <p className="text-gray-600">Detailangaben des Objekts werden hier angezeigt.</p>
        </section>
      </div>
    </PageTemplate>
  );
}