import { Check, Shield, Zap, Clock, Globe, Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CompetitiveAdvantages() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Novate?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We've analyzed the market and built Novate to address the key limitations of existing medical documentation
            solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Superior Accuracy",
              description:
                "While competitors struggle with medical terminology, our specialized AI achieves 97% accuracy in medical transcription, reducing errors by 35% compared to leading alternatives.",
              icon: Check,
              competitor: "Competitor weakness: Poor recognition of specialized medical terminology",
            },
            {
              title: "Faster Processing",
              description:
                "Process medical notes in under 30 seconds, 4x faster than industry average. Real-time transcription eliminates the waiting period common with other services.",
              icon: Zap,
              competitor: "Competitor weakness: Long processing times and delayed results",
            },
            {
              title: "Enhanced Security",
              description:
                "HIPAA-compliant with end-to-end encryption and zero data retention policies. Our security exceeds industry standards and addresses the vulnerabilities found in competing platforms.",
              icon: Shield,
              competitor: "Competitor weakness: Security vulnerabilities and compliance issues",
            },
            {
              title: "Seamless EHR Integration",
              description:
                "Direct integration with 50+ EHR systems without middleware. Our competitors typically support only 5-10 systems or require expensive custom integrations.",
              icon: Globe,
              competitor: "Competitor weakness: Limited EHR compatibility and complex integration",
            },
            {
              title: "AI-Powered Insights",
              description:
                "Unlike basic transcription tools, Novate provides clinical decision support, automatically identifying potential diagnoses, treatment options, and medication interactions.",
              icon: Brain,
              competitor: "Competitor weakness: Limited to basic transcription without clinical insights",
            },
            {
              title: "Time-Saving Automation",
              description:
                "Automated coding and billing suggestions save physicians an average of 5 hours per week compared to manual documentation or basic transcription tools.",
              icon: Clock,
              competitor: "Competitor weakness: Minimal automation requiring significant manual work",
            },
          ].map((item, i) => (
            <Card key={i} className="border-blue-100 dark:border-blue-900 h-full">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <div className="text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-md">
                  {item.competitor}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-6">Trusted by Healthcare Professionals Worldwide</h3>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {["Mayo Clinic", "Cleveland Clinic", "Johns Hopkins", "Mass General", "Stanford Health", "NYU Langone"].map(
              (org, i) => (
                <div key={i} className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                  {org}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
