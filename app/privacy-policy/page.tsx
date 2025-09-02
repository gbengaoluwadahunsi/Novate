"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Privacy Policy
              </h1>
            </div>
            <p className="text-xl text-gray-600">
              Effective Date: 2nd September 2025
            </p>
            <p className="text-lg text-gray-500">
              Last Updated: 2nd September 2025
            </p>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <Card className="mb-8">
          <CardContent className="prose prose-gray max-w-none pt-6">
            <div className="space-y-8">
              
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-700 mb-3">
                  NovateScribe ("we", "our" or "the Company") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and protect personal information when you use the NovateScribe platform.
                </p>
                <p className="text-gray-700 mb-3">
                  This Privacy Policy, together with the Terms and Conditions and Refund Policy, forms part of the Agreement. Updates will be posted on our website, and continued use constitutes acceptance.
                </p>
                <p className="text-gray-700 mb-3">
                  NovateScribe is a semi-autonomous AI platform that transcribes voice into structured medical notes, applies ICD-11 coding via a large language model (LLM), and provides analytics and labeled medical image generation. Users include healthcare professionals (such as doctors, nurses, and other licensed practitioners), patients, and medical students.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-3">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Healthcare Professional Verification:</p>
                      <p className="text-sm text-yellow-700">
                        For healthcare professionals such as doctors, we require a valid practicing certificate or license to verify that the user is certified to practice medicine. This verification is compulsory. If such documentation is not provided, the account may still be created, but it will be restricted, and all medical notes generated under that account will contain a visible watermark indicating the user has not been verified.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">
                  We operate in multiple jurisdictions, including Malaysia, the European Union (with a focus on Germany), and the United Arab Emirates. We comply with all applicable data protection laws, including Malaysia's Personal Data Protection Act 2010 (PDPA), the EU General Data Protection Regulation (GDPR), and the UAE Federal Personal Data Protection Law (Federal Decree-Law No. 45 of 2021, PDPL).
                </p>
                <p className="text-gray-700">
                  By using NovateScribe, you agree to the practices described in this Policy. If you do not agree, please do not use the platform.
                </p>
              </section>

              {/* Personal Data We Collect */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Personal Data We Collect</h2>
                <p className="text-gray-700 mb-3">
                  We collect the following categories of personal data:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-2">
                  <li><strong>Identity and Contact Information:</strong> Name, email, phone number, role (doctor, patient, student), organization/clinic (if applicable).</li>
                  <li><strong>Account and Subscription Data:</strong> Login credentials, subscription plan, billing info, transaction history.</li>
                  <li><strong>Professional Information:</strong> Medical specialization, license/practicing certificate details, hospital or clinic affiliation. Healthcare professionals must provide a valid practicing certificate or license for verification. Non-verified accounts will be marked with a watermark on all medical notes.</li>
                  <li><strong>Audio Recordings:</strong> Voice input provided for transcription (e.g., doctor-patient consultations). These may include sensitive health data.</li>
                  <li><strong>Transcribed Medical Notes and Content:</strong> Text transcripts, ICD-11 codes, labeled images, and related metadata.</li>
                  <li><strong>Medical Student Version:</strong> All patient-identifying data is automatically anonymized, regardless of patient age. Students only access anonymized notes for educational use and are prohibited from re-identification attempts.</li>
                  <li><strong>Usage Data and Analytics:</strong> Device/browser info, IP address, log data, location (city/country), error reports.</li>
                  <li><strong>Cookies and Tracking Technologies:</strong> Authentication, functional, and analytics cookies.</li>
                  <li><strong>Support and Communication Data:</strong> Messages sent to our support or administrative team.</li>
                </ul>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Children and Patient Accounts:</p>
                      <p className="text-sm text-blue-700">
                        We do not knowingly collect data from children under 13, unless a parent/legal guardian provides verified informed consent. If local law requires a higher consent age (e.g., up to 16 in the EU), that higher threshold applies. Without parental consent, accounts for children under the relevant age will not be permitted.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cookies and Tracking */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
                <p className="text-gray-700 mb-3">
                  We use cookies to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-1">
                  <li>Authenticate users,</li>
                  <li>Remember preferences,</li>
                  <li>Analyze usage (e.g., via Google Analytics or equivalent).</li>
                </ul>
                <p className="text-gray-700">
                  You may disable non-essential cookies in your browser. Essential cookies are required for core functionality (e.g., login).
                </p>
              </section>

              {/* How We Use Your Personal Data */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Personal Data</h2>
                <p className="text-gray-700 mb-3">
                  We process personal data for:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-2">
                  <li><strong>Providing services:</strong> Transcription, coding, image labeling, analytics.</li>
                  <li><strong>Account management:</strong> Authentication, subscription, billing, license verification.</li>
                  <li><strong>Improvement:</strong> Debugging, feature development, accuracy improvements.</li>
                  <li><strong>Communications:</strong> Support, updates, service notices, and (if opted-in) marketing.</li>
                  <li><strong>Analytics & research:</strong> Using anonymized or aggregated data to refine algorithms.</li>
                  <li><strong>Legal compliance & safety:</strong> Preventing fraud, fulfilling legal obligations, responding to lawful requests.</li>
                  <li><strong>Educational Use (Medical Student Accounts):</strong> All data is anonymized before students access it. Identifiers are stripped automatically, ensuring compliance and confidentiality.</li>
                </ul>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-3">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">AI Transparency:</p>
                      <p className="text-sm text-blue-700">
                        AI-generated notes, codes, images, and analytics are created automatically by large language models and automated speech recognition systems. These processes are probabilistic and may generate errors or omissions. Users should not rely on AI outputs without verification by a qualified professional.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">
                  We do not sell personal data.
                </p>
              </section>

              {/* Legal Bases for Processing */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Bases for Processing</h2>
                <p className="text-gray-700 mb-3">
                  We rely on:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>Consent</strong> (required in Malaysia & UAE for most processing, and for sensitive health data).</li>
                  <li><strong>Contractual necessity</strong> (to deliver the subscribed service).</li>
                  <li><strong>Legal obligation</strong> (e.g., financial records, responding to regulators).</li>
                  <li><strong>Vital interests</strong> (rare, life-critical cases).</li>
                  <li><strong>Public/medical interest</strong> (where allowed by GDPR/PDPA/PDPL for healthcare purposes).</li>
                  <li><strong>Legitimate interests</strong> (EU only, for service improvement and fraud prevention, when not overridden by user rights).</li>
                </ul>
              </section>

              {/* Disclosure of Personal Data */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclosure of Personal Data</h2>
                <p className="text-gray-700 mb-3">
                  We share personal data only with:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-2">
                  <li><strong>Service providers (processors):</strong> Cloud hosting, AI engines (ASR/LLM), analytics, support platforms — under strict contracts.</li>
                  <li><strong>Corporate affiliates:</strong> Within NovateScribe group companies.</li>
                  <li><strong>Business transfers:</strong> In case of mergers, acquisitions, or restructuring.</li>
                  <li><strong>Legal compliance:</strong> When required by law or to protect rights/safety.</li>
                  <li><strong>Integrations (future):</strong> Only if explicitly authorized by the user (e.g., syncing with a clinic's EMR).</li>
                </ul>
                <p className="text-gray-700">
                  We never sell personal data to third parties.
                </p>
              </section>

              {/* International Data Transfers */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
                <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-2">
                  <li><strong>Malaysia (PDPA):</strong> Transfers permitted if adequate protections or consent are in place.</li>
                  <li><strong>EU/Germany (GDPR):</strong> Safeguards include Standard Contractual Clauses (SCCs).</li>
                  <li><strong>UAE (PDPL):</strong> Transfers only to adequate jurisdictions or with contractual/consent safeguards.</li>
                </ul>
                <p className="text-gray-700">
                  Nothing in this Policy limits your rights to exercise consumer or data protection claims under mandatory local laws in your place of residence.
                </p>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>Accounts:</strong> Retained while active; deleted/anonymized after closure unless legally required.</li>
                  <li><strong>Transcriptions/Notes:</strong> Retained until deleted by user; anonymized versions may be retained for research/training.</li>
                  <li><strong>Audio:</strong> Typically deleted after transcription or within a short default period (e.g., 30 days), unless user requests retention.</li>
                  <li><strong>Analytics:</strong> Retained up to 24 months.</li>
                  <li><strong>Support records:</strong> Retained as needed for service quality and compliance.</li>
                </ul>
              </section>

              {/* Children & Minors (Parental Informed Consent) */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Children & Minors (Parental Informed Consent)</h2>
                <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-2">
                  <li><strong>Under 13 (or higher local consent age):</strong> Parental/legal guardian informed consent is required for patient accounts.</li>
                  <li><strong>Verification:</strong> We may use signed consent forms, ID checks, or in-clinic verification.</li>
                  <li><strong>Parent rights:</strong> Parents/guardians may access, correct, delete, or withdraw consent for their child's data.</li>
                  <li><strong>Medical student anonymization:</strong> Even if children's data is transcribed, it is automatically anonymized before being available to medical student accounts.</li>
                  <li><strong>Non-compliance:</strong> Accounts discovered without valid parental consent will be suspended and deleted (subject to clinical/legal obligations).</li>
                </ul>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-700 mb-3">
                  We implement:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-1">
                  <li>Encryption (in transit and at rest),</li>
                  <li>Role-based access controls,</li>
                  <li>Regular audits and vulnerability checks,</li>
                  <li>Backup and disaster recovery plans.</li>
                </ul>
                <p className="text-gray-700">
                  Despite safeguards, no system is 100% secure. Users must protect their account credentials. We notify users and authorities of breaches as required by law.
                </p>
              </section>

              {/* Your Privacy Rights */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
                <p className="text-gray-700 mb-3">
                  Depending on jurisdiction, you may exercise rights to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-1">
                  <li>Access your data,</li>
                  <li>Rectify inaccuracies,</li>
                  <li>Erase data,</li>
                  <li>Restrict processing,</li>
                  <li>Data portability,</li>
                  <li>Object to certain processing (e.g., marketing),</li>
                  <li>Withdraw consent at any time.</li>
                </ul>
                <p className="text-gray-700 mb-3">
                  <strong>Parents/Guardians:</strong> May exercise these rights on behalf of minors with verified consent.
                </p>
                <p className="text-gray-700">
                  To exercise rights, contact us (see below).
                </p>
              </section>

            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-blue-600">Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              For privacy-related questions or to exercise your rights:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> novatescribe@mynovateai.com</p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center space-x-4">
          <Link href="/terms-of-service">
            <Button variant="outline">Terms of Service</Button>
          </Link>
          <Link href="/refund-policy">
            <Button variant="outline">Refund Policy</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">Contact Us</Button>
          </Link>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 