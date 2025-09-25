import { Layout, StepCard, Button } from '../components'

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Choose Your Service",
      description: "Select the type of offense from our four categories: Driving Offenses, TV Licensing, Professional Regulation, or Minor Criminal Offenses. Each category has specialized questions tailored to your specific situation."
    },
    {
      number: 2,
      title: "Complete the Questionnaire",
      description: "Answer our guided questions in a conversational chat interface. We ask about your work, the situation, personal circumstances, and mitigation factors. The process takes about 15 minutes and can be saved and resumed anytime."
    },
    {
      number: 3,
      title: "AI Statement Generation",
      description: "Our Claude AI analyzes your responses and generates a professional mitigation statement. The AI draws from extensive legal knowledge and case law precedents to create a compelling, legally-sound document."
    },
    {
      number: 4,
      title: "Legal Review & Approval",
      description: "Every statement is reviewed and approved by a qualified solicitor before delivery. This ensures the highest standards of legal accuracy and professional quality."
    },
    {
      number: 5,
      title: "Secure Delivery",
      description: "Receive your professionally reviewed mitigation statement via secure download. The document is formatted for court or tribunal submission and ready to present."
    }
  ]

  const features = [
    {
      title: "Expert Legal Knowledge",
      description: "Our AI is trained on extensive UK legal precedents and sentencing guidelines."
    },
    {
      title: "Personalized Approach",
      description: "Each statement is tailored to your specific circumstances and situation."
    },
    {
      title: "Professional Review",
      description: "All documents are reviewed by qualified legal professionals."
    },
    {
      title: "Secure & Confidential",
      description: "Your information is protected with enterprise-grade security."
    },
    {
      title: "Fast Turnaround",
      description: "From completion to delivery in as little as 3 business days."
    },
    {
      title: "Court-Ready Format",
      description: "Documents formatted professionally for immediate submission."
    }
  ]

  return (
    <Layout
      title="How It Works - Harmonia-AI"
      description="Learn about our AI-powered process for creating professional mitigation statements"
    >
      <div className="bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                How Our Process Works
              </h1>
              <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
                From consultation to delivery, we guide you through every step of creating
                your professional mitigation statement using AI and legal expertise.
              </p>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Our 5-Step Process
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                A streamlined process designed to get you the best possible outcome
              </p>
            </div>

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-xl font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Why Choose Our Service
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Professional quality with the convenience of modern technology
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does the process take?</h3>
                <p className="text-gray-600">The questionnaire takes about 15 minutes to complete. Once submitted, you'll receive your reviewed statement within 3 business days.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my information secure?</h3>
                <p className="text-gray-600">Yes, we use enterprise-grade encryption and security measures. Your personal information is never stored permanently and is deleted after processing.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I save and resume later?</h3>
                <p className="text-gray-600">Absolutely! Your progress is automatically saved as you go through the questionnaire. You can return anytime to continue where you left off.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What if I need changes to my statement?</h3>
                <p className="text-gray-600">After receiving your statement, you can request reasonable amendments. Our legal team will review and incorporate any necessary changes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-xl text-blue-100">
                Begin your mitigation statement consultation today
              </p>
              <div className="mt-8">
                <Button href="/chat" size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                  Start Your Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}