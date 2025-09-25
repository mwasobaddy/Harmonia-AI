import { Layout } from '../components'

export default function About() {
  return (
    <Layout
      title="About Us - Harmonia-AI"
      description="Learn about our mission to provide affordable legal mitigation services powered by AI"
    >
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              About Harmonia-AI
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              Democratizing access to professional legal mitigation services
            </p>
          </div>

          <div className="mt-16 prose prose-lg mx-auto">
            <p className="text-gray-600">
              Harmonia-AI was founded with a simple mission: to make professional legal mitigation
              services accessible to everyone, regardless of their budget. We understand that facing
              legal proceedings can be stressful and expensive, which is why we've leveraged cutting-edge
              AI technology to provide high-quality mitigation statements at a fraction of traditional costs.
            </p>

            <p className="text-gray-600 mt-6">
              Our platform combines the expertise of qualified solicitors with advanced AI language models
              to generate comprehensive, legally-sound mitigation statements. Every document is reviewed
              by experienced legal professionals before delivery, ensuring the highest standards of quality
              and accuracy.
            </p>

            <div className="mt-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
              <ul className="text-gray-600 space-y-2">
                <li>• Professional quality documents reviewed by qualified solicitors</li>
                <li>• Transparent pricing with no hidden fees</li>
                <li>• Secure, confidential service protecting your privacy</li>
                <li>• Fast turnaround times to meet court deadlines</li>
                <li>• Specialized expertise across different types of legal matters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}