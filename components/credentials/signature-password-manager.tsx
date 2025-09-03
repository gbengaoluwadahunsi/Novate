// components/credentials/signature-password-manager.tsx
import React, { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function SignaturePasswordManager() {
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsSettingPassword(true);
      const response = await apiClient.setSignaturePassword(newPassword);
      if (response.success) {
        toast.success('Signature password set successfully!');
        setNewPassword('');
      } else {
        toast.error(response.error || 'Failed to set password');
      }
    } catch (error: any) {
      toast.error(`Failed to set password: ${error.message}`);
    } finally {
      setIsSettingPassword(false);
    }
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsVerifyingPassword(true);
      const result = await apiClient.verifySignaturePassword(verifyPassword);
      
      if (result.success && result.data?.isValid) {
        toast.success('Password verified successfully!');
      } else {
        toast.error(result.error || 'Invalid password');
      }
      setVerifyPassword('');
    } catch (error: any) {
      toast.error(`Verification failed: ${error.message}`);
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Signature Password Protection</h3>
      
      {/* Set Password */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h4 className="font-medium mb-3">Set New Password</h4>
        <form onSubmit={handleSetPassword} className="space-y-3">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 6 characters)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={isSettingPassword || !newPassword}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSettingPassword ? 'Setting...' : 'Set Password'}
          </button>
        </form>
      </div>

      {/* Verify Password */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h4 className="font-medium mb-3">Verify Password</h4>
        <form onSubmit={handleVerifyPassword} className="space-y-3">
          <input
            type="password"
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            placeholder="Enter password to verify"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isVerifyingPassword || !verifyPassword}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifyingPassword ? 'Verifying...' : 'Verify Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
