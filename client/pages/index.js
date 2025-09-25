import Head from 'next/head'
import { Header, Hero, ServicesSection, Info, Footer, BottomNav } from '../components'

export default function Home() {
  return (
    <>
      <Head>
        <title>Harmonia-AI - Professional Legal Mitigation Services</title>
        <meta name="description" content="AI-powered legal mitigation document preparation for minor criminal offences" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <main className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <Header />
        <Hero />
        <ServicesSection />
        <Info />
        <Footer />
        <BottomNav />
      </main>
    </>
  )
}