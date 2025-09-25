import ServiceCard from './ServiceCard'

export default function ServicesSection() {
  const services = [
    {
      title: "Driving Offenses",
      description: "Speeding, drink driving, and other motoring offenses",
      price: "£75"
    },
    {
      title: "TV Licensing",
      description: "TV license evasion and related offenses",
      price: "£65"
    },
    {
      title: "Professional Regulation",
      description: "Regulatory body hearings and professional discipline",
      price: "£95"
    },
    {
      title: "Minor Criminal Offenses",
      description: "Other minor criminal matters and summary offenses",
      price: "£75"
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Choose Your Service Type
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Specialized mitigation services for different types of legal situations
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              price={service.price}
            />
          ))}
        </div>
      </div>
    </section>
  )
}