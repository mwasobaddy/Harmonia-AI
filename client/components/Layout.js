import Head from 'next/head'
import { Header, Footer, BottomNav } from './index'
import { useAuth } from '../context/AuthContext'

export default function Layout({
  children,
  title = 'Harmonia-AI - Professional Legal Mitigation Services',
  description = 'AI-powered legal mitigation document preparation for minor criminal offences'
}) {
  const { isLoggedIn } = useAuth()

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="min-h-screen flex flex-col h-screen">
        <Header />
        <main className="flex-1 min-h-0 h-full flex flex-col overflow-y-auto">
          {children}
          <BottomNav />
        </main>
      </div>
    </>
  )
}