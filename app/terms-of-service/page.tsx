import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Terms of Service - NovateScribe",
  description: "Terms of Service for NovateScribe medical documentation platform",
}

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using NovateScribe ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              NovateScribe is a medical documentation platform that provides healthcare professionals with AI-powered transcription and note-taking services. The Service includes:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Audio transcription for medical consultations</li>
              <li>AI-generated medical notes and summaries</li>
              <li>Patient information management</li>
              <li>Medical document generation and export</li>
              <li>Healthcare professional collaboration tools</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Eligibility</h2>
            <p>
              The Service is intended for use by qualified healthcare professionals, including:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Licensed medical doctors</li>
              <li>Registered nurses</li>
              <li>Other licensed healthcare professionals</li>
              <li>Medical and healthcare students under supervision</li>
            </ul>
            <p className="mt-4">
              Users must provide accurate professional credentials and maintain valid licensing as required by their jurisdiction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Medical Disclaimer</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                IMPORTANT MEDICAL DISCLAIMER
              </p>
            </div>
            <p>
              NovateScribe is a documentation tool and does not provide medical advice, diagnosis, or treatment recommendations. The AI-generated content is for documentation purposes only and should not replace professional medical judgment. Healthcare professionals remain fully responsible for all clinical decisions and patient care.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Privacy and Data Protection</h2>
            <p>
              We take data protection seriously, especially regarding sensitive medical information:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>All patient data is encrypted in transit and at rest</li>
              <li>We comply with HIPAA, GDPR, and other applicable privacy regulations</li>
              <li>Data is processed only for the purposes of providing the Service</li>
              <li>We do not sell or share patient data with third parties</li>
              <li>Users can request data deletion at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. User Responsibilities</h2>
            <p>Users agree to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Use the Service only for legitimate medical documentation purposes</li>
              <li>Maintain the confidentiality of their account credentials</li>
              <li>Ensure patient consent is obtained before recording or transcribing consultations</li>
              <li>Comply with all applicable laws and professional standards</li>
              <li>Not use the Service for any unlawful or unauthorized purpose</li>
              <li>Report any security vulnerabilities or data breaches immediately</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by NovateScribe and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p>
              In no event shall NovateScribe be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Service Availability</h2>
            <p>
              We strive to maintain high service availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or technical issues.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
              <p><strong>Email:</strong> <a href="mailto:novatescribe@mynovateai.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200">novatescribe@mynovateai.com</a></p>
              <p><strong>Address:</strong> NovateScribe Legal Department</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 