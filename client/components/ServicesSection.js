import ServiceCard from './ServiceCard'

export default function ServicesSection() {
  const services = [
    {
      title: "Driving Offenses",
      description: "Speeding, drink driving, and other motoring offenses",
      price: "£75",
      accent: "bg-[#73cfd0]"
    },
    {
      title: "TV Licensing",
      description: "TV license evasion and related offenses",
      price: "£65",
      accent: "bg-[#73cfd0]"
    },
    {
      title: "Professional Regulation",
      description: "Regulatory body hearings and professional discipline",
      price: "£95",
      accent: "bg-[#73cfd0]"
    },
    {
      title: "Minor Criminal Offenses",
      description: "Other minor criminal matters and summary offenses",
      price: "£75",
      accent: "bg-[#73cfd0]"
    }
  ]

  return (
    <section className="py-20 bg-[#0f2b2fcc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-white mb-2">
            Our Services
          </h2>
          <p className="text-lg text-[#73cfd0] font-medium">
            Specialized mitigation for every legal situation
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <div
              key={index}
              className={`rounded-2xl shadow-lg bg-white p-7 flex flex-col items-center border-t-4 border-b-4 border-transparent hover:border-b-4 hover:border-t-4 hover:border-[#73cfd0] transition group`}
              style={{ boxShadow: '0 8px 32px 0 rgba(79,140,255,0.08)' }}
            >
              <div className={`w-14 h-14 mb-4 rounded-full ${service.accent} flex items-center justify-center text-black text-2xl font-bold shadow-lg`}>{service.title.charAt(0)}</div>
              <h3 className="text-xl font-bold text-black mb-2 text-center">{service.title}</h3>
              <p className="text-black text-center mb-4">{service.description}</p>
              <div className="mt-auto">
                <span className="inline-block px-4 py-1 rounded-full bg-[#73cfd0] text-black font-semibold text-lg shadow">{service.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}