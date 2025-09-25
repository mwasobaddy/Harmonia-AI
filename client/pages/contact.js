import { Layout, Button } from '../components'

export default function Contact() {
  return (
    <Layout
      title="Contact Us - Harmonia-AI"
      description="Get in touch with our team for questions about our legal mitigation services"
    >
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              Have questions? We're here to help.
            </p>
          </div>

          <div className="mt-16 max-w-lg mx-auto">
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Email Support</h3>
                  <p className="text-gray-600">support@Harmonia-AI.com</p>
                  <p className="text-sm text-gray-500 mt-1">We typically respond within 24 hours</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Business Hours</h3>
                  <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM GMT</p>
                  <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM GMT</p>
                  <p className="text-gray-600">Sunday: Closed</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Emergency Legal Support</h3>
                  <p className="text-gray-600">For urgent legal matters, please contact your solicitor directly.</p>
                  <p className="text-sm text-gray-500 mt-1">Our service is for mitigation statement preparation only.</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-center">
                  Ready to get started? Create your mitigation statement now.
                </p>
                <div className="mt-4 text-center">
                  <Button href="/chat" size="lg">
                    Start Your Statement
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}