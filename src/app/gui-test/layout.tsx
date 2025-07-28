"use client"

import React, { ReactNode } from 'react';

interface GuiTestLayoutProps {
  children: ReactNode;
}

// GUI-Test Page braucht ein spezielles Layout ohne das globale AppLayout
export default function GuiTestLayout({ children }: GuiTestLayoutProps) {
  return <>{children}</>;
}