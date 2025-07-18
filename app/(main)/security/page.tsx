'use client';

import React from 'react';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import { RequireAuth } from '@/components/auth/RequireAuth';

export default function SecurityPage() {
  return (
    <RequireAuth>
      <SecurityDashboard />
    </RequireAuth>
  );
}