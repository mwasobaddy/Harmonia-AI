import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Header, Footer, Button, LoadingSpinner } from '../components'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check for URL parameters on component mount
    const { token, success: successParam, error: errorParam } = router.query

    if (token) {
      // Store the token in localStorage
      localStorage.setItem('authToken', token)
      // Dispatch custom event to notify components of auth change
      window.dispatchEvent(new Event('authChange'))
      setSuccess('Successfully logged in! Redirecting...')
      setTimeout(() => {
        router.push('/chat') // Redirect to chat page after login
      }, 2000)
    } else if (successParam === 'true') {
      setSuccess('Login successful!')
    } else if (errorParam) {
      setError('Authentication failed. Please try again.')
    }
  }, [router.query, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // For now, redirect to Google OAuth
      window.location.href = 'http://localhost:5000/api/auth/google'
    } catch (err) {
      setError('Login failed. Please try again.')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google'
  }

  return (
    <>
      <Head>
        <title>Login - Harmonia-AI</title>
        <meta name="description" content="Login to your Harmonia-AI account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-md mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <div className="mb-8">
              <h2 className="text-center text-3xl font-extrabold text-gray-900">
                Sign in to your account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Or{' '}
                <Link href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
                  contact us for assistance
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-6">
                Sign in with your Google account to access our legal mitigation services.
              </p>

              <Button
                onClick={handleGoogleLogin}
                variant="primary"
                size="lg"
                className="w-full mb-4"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <p className="text-xs text-gray-500">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
                  Contact us
                </Link>
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}