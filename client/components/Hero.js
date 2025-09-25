import Button from './Button'

export default function Hero() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Professional Mitigation Statements
            <span className="block text-blue-600">at a Fraction of Solicitor Costs</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Get expertly crafted mitigation statements for minor criminal charges using AI technology
            and legal expertise. Trusted by professionals and individuals across the UK.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Button href="/chat" size="lg" className="w-full">
                Start Your Statement
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}