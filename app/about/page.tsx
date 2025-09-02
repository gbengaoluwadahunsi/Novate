"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Target, Users, Shield, Globe, Award, Heart, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About NovateScribe
          </h1>
          <p className="text-xl text-gray-600">
            Transforming medical documentation through AI-powered innovation
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center gap-3 mb-4">
              <Target className="w-8 h-8" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xl leading-relaxed">
              To revolutionize healthcare documentation by providing doctors, medical students, and healthcare professionals 
              with intelligent, accurate, and time-saving transcription tools that enhance patient care and reduce administrative burden.
            </p>
          </CardContent>
        </Card>

        {/* What We Do */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">AI-Powered Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced speech recognition technology that converts voice recordings into structured medical notes with high accuracy.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">ICD-11 Coding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automatic suggestion of WHO ICD-11 diagnostic codes to streamline medical coding and billing processes.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">HIPAA Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Enterprise-grade security and compliance with healthcare data protection standards worldwide.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Our Story */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              NovateScribe was born from a simple observation: healthcare professionals spend countless hours on documentation, 
              taking time away from what matters most - patient care. Our founders, experienced in both healthcare and technology, 
              recognized the potential of AI to transform this critical aspect of medical practice.
            </p>
            <p>
              Starting in Malaysia and expanding globally, we've built a platform that combines cutting-edge artificial intelligence 
              with deep understanding of healthcare workflows. Our technology serves diverse users - from medical students learning 
              documentation to experienced doctors managing busy practices.
            </p>
            <p>
              Today, NovateScribe is trusted by healthcare professionals across multiple countries, helping them save time, 
              improve accuracy, and focus on what they do best: caring for patients.
            </p>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Patient-First Approach</h3>
                    <p className="text-sm text-gray-600">Everything we do is designed to improve patient care and outcomes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Trust & Security</h3>
                    <p className="text-sm text-gray-600">We prioritize the security and privacy of sensitive medical information.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Innovation</h3>
                    <p className="text-sm text-gray-600">We continuously push the boundaries of what's possible with AI in healthcare.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Collaboration</h3>
                    <p className="text-sm text-gray-600">We work closely with healthcare professionals to understand their needs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Global Accessibility</h3>
                    <p className="text-sm text-gray-600">Making advanced medical technology accessible to healthcare professionals worldwide.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Excellence</h3>
                    <p className="text-sm text-gray-600">We strive for the highest quality in every aspect of our service.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">Our Technology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              NovateScribe leverages state-of-the-art artificial intelligence and machine learning technologies to deliver 
              exceptional accuracy and performance:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Advanced Speech Recognition:</strong> Powered by cutting-edge ASR technology for high-accuracy transcription</li>
              <li><strong>Natural Language Processing:</strong> AI models trained on medical terminology and documentation patterns</li>
              <li><strong>ICD-11 Integration:</strong> Direct connection to WHO's official diagnostic coding system</li>
              <li><strong>Multi-Language Support:</strong> Transcription capabilities in multiple languages for global accessibility</li>
              <li><strong>Real-Time Processing:</strong> Fast transcription with options for immediate or batch processing</li>
            </ul>
          </CardContent>
        </Card>

        {/* Global Reach */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">Global Reach & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              NovateScribe serves healthcare professionals worldwide while maintaining compliance with local regulations:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Malaysia</h3>
                <p className="text-sm text-blue-600">PDPA Compliant</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">European Union</h3>
                <p className="text-sm text-green-600">GDPR Compliant</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">United States</h3>
                <p className="text-sm text-purple-600">HIPAA Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">Our Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              NovateScribe is built by a diverse team of healthcare professionals, AI researchers, software engineers, 
              and business experts who share a common vision of improving healthcare through technology.
            </p>
            <p>
              Our leadership team brings decades of combined experience in healthcare technology, artificial intelligence, 
              and business operations, ensuring that NovateScribe meets the real-world needs of healthcare professionals.
            </p>
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-4">
              We'd love to hear from you. Whether you have questions about our service, want to provide feedback, 
              or are interested in partnerships, reach out to us:
            </p>
            <div className="space-y-2 text-blue-700">
              <p><strong>General Inquiries:</strong> <a href="mailto:novatescribe@mynovateai.com" className="underline hover:text-blue-900">novatescribe@mynovateai.com</a></p>
              <p><strong>Support:</strong> <a href="mailto:novatescribe@mynovateai.com" className="underline hover:text-blue-900">novatescribe@mynovateai.com</a></p>
              <p><strong>Website:</strong> <a href="https://www.novatescribe.com/" className="underline hover:text-blue-900" target="_blank" rel="noopener noreferrer">https://www.novatescribe.com/</a></p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center mt-8 space-x-4">
          <Link href="/pricing">
            <Button variant="outline">View Pricing</Button>
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
