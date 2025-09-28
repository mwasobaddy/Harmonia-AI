import StepCard from './StepCard'

export default function Info() {
  const steps = [
    {
      number: 1,
      title: "Choose Your Service",
      description: "Select the type of offense and complete our guided questionnaire"
    },
    {
      number: 2,
      title: "AI Generation",
      description: "Our AI creates a professional mitigation statement using legal expertise"
    },
    {
      number: 3,
      title: "Legal Review",
      description: "Qualified solicitor reviews and approves before delivery"
    }
  ]

  return (
    <section className="py-20 bg-[#0f2b2fcc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-white mb-2">
            How It Works
          </h2>
          <p className="text-lg text-[#73cfd0] font-medium">
            Simple, secure, and solicitor-reviewed mitigation in three steps
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="rounded-2xl shadow-lg bg-white p-8 flex flex-col items-center border-t-4 border-b-4 border-transparent hover:border-b-4 hover:border-t-4 hover:border-[#73cfd0] transition group"
              style={{ boxShadow: '0 8px 32px 0 rgba(79,140,255,0.08)' }}
            >
              <div className="w-14 h-14 mb-4 rounded-full bg-[#73cfd0] flex items-center justify-center text-black text-2xl font-bold shadow-lg">{step.number}</div>
              <h3 className="text-xl font-bold text-black mb-2 text-center">{step.title}</h3>
              <p className="text-black text-center">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}