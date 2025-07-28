"use client"

import React, { useEffect, ReactNode } from 'react';

interface PageTemplateProps {
  title: string;
  children: ReactNode;
  enableSectionNavigation?: boolean;
}

export const PageTemplate: React.FC<PageTemplateProps> = ({ 
  title, 
  children, 
  enableSectionNavigation = false 
}) => {
  useEffect(() => {
    if (enableSectionNavigation) {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [enableSectionNavigation]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
      {children}
    </div>
  );
};