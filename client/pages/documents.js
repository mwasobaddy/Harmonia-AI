import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../lib/api';
import { FileText, Download, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Documents() {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    loadDocuments();
  }, [router]);

  const loadDocuments = async () => {
    try {
      const response = await api.getDocuments();
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (documentId, fileName) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'Under Review';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Documents - Harmonia-AI</title>
        </Head>
        <div className="min-h-screen bg-gray-50 pb-16 md:pb-0 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
          <BottomNav />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Documents - Harmonia-AI</title>
        <meta name="description" content="View and manage your documents" />
      </Head>

      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0 flex flex-col">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Documents</h1>
            <p className="mt-2 text-gray-600">View and download your mitigation statements and documents.</p>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-500 mb-4">Complete a consultation to generate your first mitigation statement.</p>
              <button
                onClick={() => router.push('/chat')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start a Consultation
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {documents.map((document) => (
                <div key={document.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getStatusIcon(document.status)}
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          Mitigation Statement
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Created on {new Date(document.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            document.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                            document.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            document.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusText(document.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedDocument(selectedDocument?.id === document.id ? null : document)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {document.status === 'APPROVED' && (
                        <button
                          onClick={() => downloadDocument(document.id, `mitigation-statement-${document.id}.txt`)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedDocument?.id === document.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Document Preview</h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                          {document.content.length > 1000
                            ? document.content.substring(0, 1000) + '...'
                            : document.content
                          }
                        </pre>
                      </div>
                      {document.status === 'PENDING_REVIEW' && (
                        <p className="text-sm text-yellow-600 mt-2">
                          This document is currently under review by our legal team. You'll be notified once it's approved.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
}