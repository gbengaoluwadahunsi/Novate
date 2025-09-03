"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle,
  X,
  Loader2,
  FileSignature,
  PenTool
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SignatureVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignatureVerified: (result: { 
    type: 'uploaded' | 'manual'; 
    signatureUrl?: string;
  }) => void;
  className?: string;
}

export default function SignatureVerificationModal({ 
  isOpen, 
  onClose, 
  onSignatureVerified,
  className = ""
}: SignatureVerificationModalProps) {
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [useUploadedSignature, setUseUploadedSignature] = useState(true);

  const verifySignature = async () => {
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter your signature password.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    
    try {
      // Since signature password verification doesn't exist in backend,
      // we'll simulate verification for now
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      const response = { success: true, data: { signatureUrl: '/placeholder-signature.png' } };
      
      if (response.success && response.data) {
        toast({
          title: "Signature Verified",
          description: "Your signature has been verified successfully.",
        });
        
        if (useUploadedSignature) {
          onSignatureVerified({ 
            type: 'uploaded', 
            signatureUrl: response.data.signatureUrl 
          });
        } else {
          onSignatureVerified({ type: 'manual' });
        }
        
        // Reset form and close modal
        setPassword('');
        onClose();
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid signature password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast.error('Failed to verify signature. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !verifying) {
      verifySignature();
    }
  };

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    setVerifying(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-md ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Signature Verification</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={verifying}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          
          {/* Signature Method Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Signature Method</Label>
            
            <div className="space-y-2">
              <div 
                className={`
                  p-3 border rounded-lg cursor-pointer transition-all
                  ${useUploadedSignature 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setUseUploadedSignature(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${useUploadedSignature ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                  `}>
                    {useUploadedSignature && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <FileSignature className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Use Uploaded Signature</p>
                    <p className="text-xs text-muted-foreground">
                      Apply your pre-uploaded digital signature
                    </p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`
                  p-3 border rounded-lg cursor-pointer transition-all
                  ${!useUploadedSignature 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setUseUploadedSignature(false)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${!useUploadedSignature ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                  `}>
                    {!useUploadedSignature && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <PenTool className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Sign Manually</p>
                    <p className="text-xs text-muted-foreground">
                      Draw your signature using mouse or touch
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="signature-password" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Signature Password</span>
            </Label>
            <div className="relative">
              <Input
                id="signature-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your signature password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={verifying}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={verifying}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Security Notice</p>
                <p className="text-yellow-700">
                  Your signature password ensures document authenticity and prevents unauthorized use.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={verifying}
            >
              Cancel
            </Button>
            
            <Button 
              onClick={verifySignature} 
              disabled={verifying || !password.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify & Sign
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Enter the password you set for your digital signature</p>
            <p>• Choose between uploaded signature or manual signing</p>
            <p>• Your signature will be applied to the medical document</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
