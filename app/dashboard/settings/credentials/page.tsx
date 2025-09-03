// app/dashboard/settings/credentials/page.tsx
'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import DoctorCredentialsManager from '@/components/credentials/doctor-credentials-manager';
import SignaturePasswordManager from '@/components/credentials/signature-password-manager';
import { toast } from 'sonner';

export default function CredentialsPage() {
  const { user } = useAppSelector(state => state.auth);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Doctor Credentials</h1>
        <p className="text-gray-600 mt-2">
          Manage your professional credentials including certificates, signatures, stamps, and letterheads.
        </p>
      </div>

      <div className="space-y-8">
        <DoctorCredentialsManager
          userId={user.id}
        />
        
        <SignaturePasswordManager />
      </div>
    </div>
  );
}