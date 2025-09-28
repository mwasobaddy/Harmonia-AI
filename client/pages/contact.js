import { Layout, Button, Footer } from '../components'

export default function Contact() {
  return (
    <Layout
      title="Contact Us - Harmonia-AI"
      description="Get in touch with our team for questions about our legal mitigation services"
    >
      <div className="bg-[#0f2b2fcc]">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-4 text-xl text-[#73cfd0]">
              Have questions? We're here to help.
            </p>
          </div>

          <div className="mt-16 max-w-lg mx-auto">
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-2xl font-bold text-black mb-6">Get in Touch</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-black mb-2">Email Support</h3>
                  <p className="text-black">support@Harmonia-AI.com</p>
                  <p className="text-sm text-[#73cfd0] mt-1">We typically respond within 24 hours</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-black mb-2">Business Hours</h3>
                  <p className="text-black">Monday - Friday: 9:00 AM - 6:00 PM GMT</p>
                  <p className="text-black">Saturday: 10:00 AM - 4:00 PM GMT</p>
                  <p className="text-black">Sunday: Closed</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-black mb-2">Emergency Legal Support</h3>
                  <p className="text-black">For urgent legal matters, please contact your solicitor directly.</p>
                  <p className="text-sm text-[#73cfd0] mt-1">Our service is for mitigation statement preparation only.</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#73cfd0]">
                <p className="text-black text-center">
                  Ready to get started? Create your mitigation statement now.
                </p>
                <div className="mt-4 text-center">
                  <Button href="/chat" size="lg" className="bg-[#73cfd0] text-black hover:bg-white hover:text-[#0f2b2fcc]">
                    Start Your Statement
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  )
}