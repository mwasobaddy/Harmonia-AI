import { Layout, ServiceCard } from '../components'

export default function Services() {
  const services = [
    {
      title: "Driving Offenses",
      description: "Speeding, drink driving, and other motoring offenses. Our AI understands the specific requirements for magistrates' courts and can reference relevant sentencing guidelines.",
      price: "£75",
      features: ["Traffic violation expertise", "Drink driving mitigation", "Speeding offense statements", "License implications assessment"]
    },
    {
      title: "TV Licensing",
      description: "TV license evasion and related offenses. Specialized knowledge of broadcasting regulations and enforcement procedures.",
      price: "£65",
      features: ["Broadcasting law expertise", "Regulatory compliance", "Financial circumstances", "Alternative payment arrangements"]
    },
    {
      title: "Professional Regulation",
      description: "Regulatory body hearings and professional discipline matters. Understanding of professional conduct rules and tribunal procedures.",
      price: "£95",
      features: ["Professional regulation knowledge", "Tribunal procedures", "Career impact assessment", "Remedial action planning"]
    },
    {
      title: "Minor Criminal Offenses",
      description: "Other minor criminal matters and summary offenses. Comprehensive coverage of criminal justice procedures and mitigation factors.",
      price: "£75",
      features: ["Criminal law expertise", "Court procedure knowledge", "Character references", "Personal circumstances"]
    }
  ]

  return (
    <Layout
      title="Our Services - Harmonia-AI"
      description="Professional mitigation statement services for different types of legal matters"
    >
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Our Services
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              Specialized mitigation services tailored to your specific legal situation
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                  <span className="text-2xl font-bold text-blue-600">{service.price}</span>
                </div>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6">
              All services include professional solicitor review and approval before delivery.
            </p>
            <a
              href="/chat"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Start Your Statement
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}