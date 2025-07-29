import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Privacy Policy - NovateScribe",
  description: "Privacy Policy for NovateScribe medical documentation platform",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              NovateScribe ("we," "our," or "us") is committed to protecting your privacy and the confidentiality of patient information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our medical documentation platform.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
              <p className="font-semibold text-blue-800 dark:text-blue-200">
                HIPAA COMPLIANCE NOTICE
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-2">
                We are committed to HIPAA compliance and maintaining the highest standards of medical data protection.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3">2.1 Healthcare Professional Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Name, email address, and contact information</li>
              <li>Professional credentials and licensing information</li>
              <li>Medical specialization and practice details</li>
              <li>Hospital or clinic affiliation</li>
              <li>Account preferences and settings</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.2 Patient Health Information (PHI)</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Audio recordings of medical consultations</li>
              <li>Transcribed medical notes and documentation</li>
              <li>Patient demographic information (name, age, gender)</li>
              <li>Medical history and clinical observations</li>
              <li>Diagnostic information and treatment plans</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.3 Technical Information</h3>
            <ul className="list-disc pl-6">
              <li>Device information and browser type</li>
              <li>IP address and location data</li>
              <li>Usage patterns and service interactions</li>
              <li>Log files and error reports</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            
            <h3 className="text-xl font-semibold mb-3">3.1 Service Provision</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Transcribe audio recordings into medical notes</li>
              <li>Generate AI-powered medical documentation</li>
              <li>Provide clinical decision support tools</li>
              <li>Enable secure document sharing and collaboration</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 Service Improvement</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Improve transcription accuracy and AI models</li>
              <li>Enhance user experience and interface design</li>
              <li>Develop new features and functionality</li>
              <li>Conduct quality assurance and performance monitoring</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.3 Legal and Regulatory Compliance</h3>
            <ul className="list-disc pl-6">
              <li>Comply with healthcare regulations (HIPAA, GDPR, etc.)</li>
              <li>Respond to legal requests and court orders</li>
              <li>Maintain audit trails and access logs</li>
              <li>Report security incidents as required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security and Protection</h2>
            
            <h3 className="text-xl font-semibold mb-3">4.1 Encryption</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>All data is encrypted in transit using TLS 1.3</li>
              <li>Data at rest is encrypted using AES-256 encryption</li>
              <li>Database encryption with rotating keys</li>
              <li>End-to-end encryption for sensitive communications</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.2 Access Controls</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Multi-factor authentication for all accounts</li>
              <li>Role-based access control (RBAC)</li>
              <li>Regular access reviews and deprovisioning</li>
              <li>Audit logging of all data access</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.3 Infrastructure Security</h3>
            <ul className="list-disc pl-6">
              <li>SOC 2 Type II certified data centers</li>
              <li>Regular security assessments and penetration testing</li>
              <li>24/7 security monitoring and incident response</li>
              <li>Backup and disaster recovery procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
            <p className="mb-4">
              We do not sell, trade, or otherwise transfer your personal information or PHI to third parties, except in the following limited circumstances:
            </p>
            
            <h3 className="text-xl font-semibold mb-3">5.1 With Your Consent</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>When you explicitly authorize data sharing</li>
              <li>For care coordination with other healthcare providers</li>
              <li>For research purposes with proper consent</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">5.2 Legal Requirements</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>To comply with court orders or legal process</li>
              <li>To report suspected abuse or neglect</li>
              <li>For public health and safety purposes</li>
              <li>To prevent serious threats to health or safety</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">5.3 Service Providers</h3>
            <ul className="list-disc pl-6">
              <li>Cloud infrastructure providers (with BAAs)</li>
              <li>AI and transcription service partners</li>
              <li>Security and monitoring services</li>
              <li>All third parties sign Business Associate Agreements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
            
            <h3 className="text-xl font-semibold mb-3">6.1 Access and Portability</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Request access to your personal information</li>
              <li>Export your data in standard formats</li>
              <li>Obtain copies of medical documentation</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.2 Correction and Updates</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Correct inaccurate personal information</li>
              <li>Update professional credentials</li>
              <li>Modify account preferences</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.3 Deletion and Retention</h3>
            <ul className="list-disc pl-6">
              <li>Request deletion of your account and data</li>
              <li>Data retention periods comply with legal requirements</li>
              <li>Secure deletion procedures for all media</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. International Data Transfers</h2>
            <p>
              If you are located outside the United States, please note that we may transfer your information to the United States and other countries. We ensure appropriate safeguards are in place for international transfers, including:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Adequacy decisions by relevant authorities</li>
              <li>Certification under recognized frameworks</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <p>
              Our Service is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Sending an email to your registered address</li>
              <li>Posting a notice on our website</li>
              <li>Displaying an in-app notification</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
              <p><strong>Privacy Officer:</strong> privacy@novatescribe.com</p>
              <p><strong>Data Protection Officer:</strong> dpo@novatescribe.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Address:</strong> NovateScribe Privacy Department<br />
              123 Healthcare Boulevard<br />
              Medical District, State 12345</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Regulatory Compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 dark:text-green-200">HIPAA Compliant</h4>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                  Health Insurance Portability and Accountability Act
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">GDPR Compliant</h4>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                  General Data Protection Regulation
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 