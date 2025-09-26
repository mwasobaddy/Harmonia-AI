import Head from 'next/head'
import { Header, Footer, BottomNav } from './index'

export default function Layout({
  children,
  title = 'Harmonia-AI - Professional Legal Mitigation Services',
  description = 'AI-powered legal mitigation document preparation for minor criminal offences'
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="min-h-screen flex flex-col pb-16 md:pb-0">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <BottomNav />
      </div>
    </>
  )
}