"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageTemplate } from '@/components/PageTemplate';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

// Landing Page Component - redirects to GUI-Test
const Page: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to gui-test page after component mounts
    router.push('/gui-test');
  }, [router]);

  return (
    <PageTemplate title="Willkommen">
      <div className="text-center">
        <p className="text-gray-600">Sie werden automatisch zur GUI-Test Seite weitergeleitet...</p>
      </div>
    </PageTemplate>
  );
};

export default Page;