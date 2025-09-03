// components/credentials/doctor-credentials-manager.tsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getUser } from '@/store/features/authSlice';

interface DoctorCredentialsManagerProps {
  userId: string;
}

export default function DoctorCredentialsManager({ userId }: DoctorCredentialsManagerProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // File validation
  const validateFile = (file: File, type: string): boolean => {
    const maxSizes: { [key: string]: number } = {
      certificate: 10 * 1024 * 1024, // 10MB
      signature: 5 * 1024 * 1024,    // 5MB
      stamp: 5 * 1024 * 1024,        // 5MB
      letterhead: 5 * 1024 * 1024    // 5MB
    };

    const allowedTypes: { [key: string]: string[] } = {
      certificate: ['application/pdf', 'image/jpeg', 'image/png'],
      signature: ['image/jpeg', 'image/png'],
      stamp: ['image/jpeg', 'image/png'],
      letterhead: ['image/jpeg', 'image/png']
    };

    if (file.size > maxSizes[type]) {
      toast.error(`File too large. Maximum size for ${type} is ${maxSizes[type] / (1024 * 1024)}MB`);
      return false;
    }

    if (!allowedTypes[type].includes(file.type)) {
      toast.error(`Invalid file type. Allowed types: ${allowedTypes[type].join(', ')}`);
      return false;
    }

    return true;
  };

  // Handle file upload
  const handleFileUpload = async (
    file: File, 
    credentialType: 'certificate' | 'signature' | 'stamp' | 'letterhead'
  ) => {
    try {
      // Validate file
      if (!validateFile(file, credentialType)) {
        return;
      }

      setIsUploading(credentialType);
      setUploadProgress(prev => ({ ...prev, [credentialType]: 0 }));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [credentialType]: Math.min((prev[credentialType] || 0) + 10, 90)
        }));
      }, 200);

      // Upload file using appropriate API method
      let result;
      switch (credentialType) {
        case 'certificate':
          result = await apiClient.uploadCertificate(file);
          break;
        case 'signature':
          result = await apiClient.uploadSignature(file);
          break;
        case 'stamp':
          result = await apiClient.uploadStamp(file);
          break;
        case 'letterhead':
          result = await apiClient.uploadLetterhead(file);
          break;
      }

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [credentialType]: 100 }));
      
      if (result.success) {
        dispatch(getUser()); // Refresh user data
        toast.success(`${credentialType.charAt(0).toUpperCase() + credentialType.slice(1)} uploaded successfully!`);
      } else {
        toast.error(result.error || `Failed to upload ${credentialType}`);
      }

    } catch (error: any) {
      console.error(`Failed to upload ${credentialType}:`, error);
      toast.error(`Failed to upload ${credentialType}: ${error.message}`);
    } finally {
      setIsUploading(null);
      setUploadProgress(prev => ({ ...prev, [credentialType]: 0 }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Doctor Credentials</h2>
      
      {/* Practicing Certificate */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Practicing Certificate</h3>
        <div className="flex items-center space-x-4">
          {user?.practicingCertificateUrl ? (
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Current Certificate</p>
              <p className="text-sm text-gray-800 mb-2">
                Expires: {user.practicingCertificateExpiryDate ? new Date(user.practicingCertificateExpiryDate).toLocaleDateString() : 'Not set'}
              </p>
              <a 
                href={user.practicingCertificateUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Certificate
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No certificate uploaded</p>
          )}
          
          <div className="flex-shrink-0">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'certificate');
              }}
              disabled={isUploading === 'certificate'}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            {isUploading === 'certificate' && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.certificate || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">Uploading... {uploadProgress.certificate || 0}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Digital Signature */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Digital Signature</h3>
        <div className="flex items-center space-x-4">
          {user?.signatureUrl ? (
            <div className="flex-1">
              <img 
                src={user.signatureUrl} 
                alt="Digital Signature" 
                className="h-16 w-auto border border-gray-200 rounded-lg shadow-sm"
              />
              <a 
                href={user.signatureUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium block mt-2"
              >
                View Full Size
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No signature uploaded</p>
          )}
          
          <div className="flex-shrink-0">
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'signature');
              }}
              disabled={isUploading === 'signature'}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            {isUploading === 'signature' && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.signature || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">Uploading... {uploadProgress.signature || 0}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Stamp */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Doctor Stamp</h3>
        <div className="flex items-center space-x-4">
          {user?.stampUrl ? (
            <div className="flex-1">
              <img 
                src={user.stampUrl} 
                alt="Doctor Stamp" 
                className="h-16 w-auto border border-gray-200 rounded-lg shadow-sm"
              />
              <a 
                href={user.stampUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium block mt-2"
              >
                View Full Size
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No stamp uploaded</p>
          )}
          
          <div className="flex-shrink-0">
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'stamp');
              }}
              disabled={isUploading === 'stamp'}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            {isUploading === 'stamp' && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.stamp || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">Uploading... {uploadProgress.stamp || 0}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Letterhead */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Letterhead</h3>
        <div className="flex items-center space-x-4">
          {user?.letterheadUrl ? (
            <div className="flex-1">
              <img 
                src={user.letterheadUrl} 
                alt="Letterhead" 
                className="h-16 w-auto border border-gray-200 rounded-lg shadow-sm"
              />
              <a 
                href={user.letterheadUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium block mt-2"
              >
                View Full Size
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No letterhead uploaded</p>
          )}
          
          <div className="flex-shrink-0">
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'letterhead');
              }}
              disabled={isUploading === 'letterhead'}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            {isUploading === 'letterhead' && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.letterhead || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">Uploading... {uploadProgress.letterhead || 0}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Verification Status</h3>
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            user?.isDocumentVerified ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <span className="text-sm font-medium">
            {user?.isDocumentVerified ? 'Documents Verified' : 'Documents Pending Verification'}
          </span>
        </div>
        {!user?.isDocumentVerified && (
          <p className="text-sm text-gray-600">
            Your documents are under review. This process typically takes 1-2 business days.
          </p>
        )}
      </div>
    </div>
  );
}
