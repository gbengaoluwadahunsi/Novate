"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Upload
} from "lucide-react";
import Link from 'next/link';

interface DoctorVerificationStatusProps {
  verificationStatus: {
    isVerified: boolean;
    certificateStatus: 'none' | 'pending' | 'verified' | 'rejected' | 'expired';
    certificateExpiryDate?: string;
    rejectionReason?: string;
    lastUpdated?: string;
  };
  showActions?: boolean;
  className?: string;
}

export default function DoctorVerificationStatus({ 
  verificationStatus, 
  showActions = true,
  className = "" 
}: DoctorVerificationStatusProps) {
  
  const getStatusIcon = () => {
    switch (verificationStatus.certificateStatus) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus.certificateStatus) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified Doctor
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Verification Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Verification Rejected
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Certificate Expired
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Shield className="h-3 w-3 mr-1" />
            Not Verified
          </Badge>
        );
    }
  };

  const getStatusMessage = () => {
    switch (verificationStatus.certificateStatus) {
      case 'verified':
        return {
          title: "Doctor Verification Complete",
          description: "Your practicing certificate has been verified. All medical notes will be marked as verified.",
          color: "text-green-800"
        };
      case 'pending':
        return {
          title: "Verification In Progress",
          description: "Your practicing certificate is being reviewed. This typically takes 1-3 business days.",
          color: "text-yellow-800"
        };
      case 'rejected':
        return {
          title: "Verification Rejected",
          description: verificationStatus.rejectionReason || "Your certificate could not be verified. Please upload a valid practicing certificate.",
          color: "text-red-800"
        };
      case 'expired':
        return {
          title: "Certificate Expired",
          description: "Your practicing certificate has expired. Please upload a current certificate to maintain verification status.",
          color: "text-orange-800"
        };
      default:
        return {
          title: "Verification Required",
          description: "Upload your annual practicing certificate to verify your medical credentials and remove watermarks from notes.",
          color: "text-gray-700"
        };
    }
  };

  const statusMessage = getStatusMessage();
  const isExpiringSoon = verificationStatus.certificateExpiryDate && 
    new Date(verificationStatus.certificateExpiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Doctor Verification Status</span>
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        
        {/* Status Message */}
        <div className={`p-4 rounded-lg ${
          verificationStatus.certificateStatus === 'verified' ? 'bg-green-50 border border-green-200' :
          verificationStatus.certificateStatus === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
          verificationStatus.certificateStatus === 'rejected' ? 'bg-red-50 border border-red-200' :
          verificationStatus.certificateStatus === 'expired' ? 'bg-orange-50 border border-orange-200' :
          'bg-gray-50 border border-gray-200'
        }`}>
          <h4 className={`font-medium ${statusMessage.color}`}>
            {statusMessage.title}
          </h4>
          <p className={`text-sm mt-1 ${statusMessage.color}`}>
            {statusMessage.description}
          </p>
        </div>

        {/* Certificate Expiry Warning */}
        {isExpiringSoon && verificationStatus.certificateStatus === 'verified' && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Certificate Expiring Soon</h4>
                <p className="text-sm text-orange-700">
                  Your certificate expires on {new Date(verificationStatus.certificateExpiryDate!).toLocaleDateString()}. 
                  Please upload a renewed certificate to maintain your verification status.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Details */}
        {verificationStatus.certificateExpiryDate && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm">Certificate Information</h5>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Expiry Date: {new Date(verificationStatus.certificateExpiryDate).toLocaleDateString()}</p>
              {verificationStatus.lastUpdated && (
                <p>Last Updated: {new Date(verificationStatus.lastUpdated).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        )}

        {/* Rejection Details */}
        {verificationStatus.certificateStatus === 'rejected' && verificationStatus.rejectionReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <h5 className="font-medium text-red-800 text-sm">Rejection Reason:</h5>
            <p className="text-sm text-red-700 mt-1">{verificationStatus.rejectionReason}</p>
          </div>
        )}

        {/* Impact Notice */}
        {!verificationStatus.isVerified && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-800 text-sm">Impact on Medical Notes</h5>
                <p className="text-sm text-blue-700">
                  All medical notes will include a "Non-Verified Doctor" watermark until verification is complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex flex-wrap gap-2">
            {(verificationStatus.certificateStatus === 'none' || 
              verificationStatus.certificateStatus === 'rejected' ||
              verificationStatus.certificateStatus === 'expired') && (
              <Link href="/dashboard/settings/credentials">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Certificate
                </Button>
              </Link>
            )}
            
            {verificationStatus.certificateStatus === 'pending' && (
              <Button variant="outline" disabled>
                <Clock className="h-4 w-4 mr-2" />
                Awaiting Review
              </Button>
            )}
            
            {isExpiringSoon && verificationStatus.certificateStatus === 'verified' && (
              <Link href="/dashboard/settings/credentials">
                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                  <Upload className="h-4 w-4 mr-2" />
                  Renew Certificate
                </Button>
              </Link>
            )}
            
            <Link href="/dashboard/settings/credentials">
              <Button variant="ghost">
                <Shield className="h-4 w-4 mr-2" />
                Manage Credentials
              </Button>
            </Link>
          </div>
        )}

        {/* Help Links */}
        <div className="pt-2 border-t">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <button className="flex items-center space-x-1 hover:text-foreground">
              <ExternalLink className="h-3 w-3" />
              <span>Verification Guidelines</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-foreground">
              <FileText className="h-3 w-3" />
              <span>Acceptable Documents</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-foreground">
              <Shield className="h-3 w-3" />
              <span>Privacy Policy</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
