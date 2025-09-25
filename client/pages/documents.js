import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

export default function Documents() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Documents - Harmonia-AI</title>
        <meta name="description" content="View and manage your documents" />
      </Head>

      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Documents</h1>
          <p className="mt-4 text-gray-600">Here you can view and manage your uploaded documents.</p>

          {/* Placeholder for document list */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <p className="text-gray-500">No documents available. Upload your first document to get started.</p>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
}