import StepCard from './StepCard'

export default function HowItWorksSection() {
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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            How It Works
          </h2>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <StepCard
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}