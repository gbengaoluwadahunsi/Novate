"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Shield, 
  Zap, 
  Globe, 
  Users, 
  Award,
  CheckCircle,
  Star
} from "lucide-react"

const advantages = [
  {
    icon: Brain,
    title: "AI-Powered Accuracy",
    description: "Advanced machine learning algorithms ensure 99.2% transcription accuracy with medical terminology recognition.",
    features: ["Medical terminology trained", "Context-aware processing", "Continuous learning"],
    badge: "Industry Leading"
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Enterprise-grade security with end-to-end encryption and full HIPAA compliance for patient data protection.",
    features: ["End-to-end encryption", "Audit trails", "Data residency control"],
    badge: "Certified"
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "Lightning-fast transcription with real-time processing and instant medical note generation.",
    features: ["< 30 second processing", "Live preview", "Instant results"],
    badge: "Fastest"
  },
  {
    icon: Globe,
    title: "Multi-language Support",
    description: "Support for 15+ languages including Arabic, Malay, Chinese, and regional dialects.",
    features: ["15+ languages", "Regional dialects", "Cultural context"],
    badge: "Global"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Built for healthcare teams with real-time collaboration, version control, and approval workflows.",
    features: ["Real-time collaboration", "Version control", "Approval workflows"],
    badge: "Collaborative"
  },
  {
    icon: Award,
    title: "Medical Expertise",
    description: "Developed by healthcare professionals with deep understanding of medical workflows and requirements.",
    features: ["Medical expertise", "Clinical validation", "Best practices"],
    badge: "Expert"
  }
]

export default function CompetitiveAdvantages() {
  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Star className="w-3 h-3 mr-1" />
            Why Choose NovateScribe™
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Unmatched Medical Transcription Excellence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of medical documentation with cutting-edge AI technology 
            designed specifically for healthcare professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((advantage, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <advantage.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {advantage.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{advantage.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {advantage.description}
                </p>
                <ul className="space-y-2">
                  {advantage.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">99.2%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">&lt;30s</div>
              <div className="text-sm text-muted-foreground">Processing Time</div>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
              <div className="text-sm text-muted-foreground">Availability</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 