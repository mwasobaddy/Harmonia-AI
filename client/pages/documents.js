
import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Layout from '../components/Layout';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../lib/api';
import { FileText, Download, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

export default function Documents() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  // Animation ref for card entrance
  const cardsRef = useRef([]);

  useEffect(() => {
    // Check authentication
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
      return;
    }
    if (isLoggedIn) {
      loadDocuments();
    }
  }, [router, isLoggedIn, authLoading]);

  // Animate in cards on load
  useEffect(() => {
    if (documents.length > 0 && cardsRef.current.length > 0) {
      gsap.fromTo(
        cardsRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out' }
      );
    }
  }, [documents]);

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
          <title>Documents - StreetLegal-AI</title>
        </Head>
        <div className="min-h-screen bg-[#0f2b2fcc] md:pb-0 flex flex-col">
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
      <Layout
        title="Chat - StreetLegal-AI"
        description="Your chat conversations"
      >

  <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-[#0f2b2fcc] items-center">
        <div className="max-w-7xl md:px-6 lg:px-8 flex-1 flex justify-center min-h-0">
          <div className={`flex overflow-hidden w-full flex-1 min-h-0 flex-col`}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Your Documents</h1>
              <p className="mt-2 text-[#73cfd0]">View and download your mitigation statements and documents.</p>
            </div>

            {documents.length === 0 ? (
              <div className="bg-[#2a4a5a] shadow rounded-lg p-8 text-center border border-[#73cfd0]/20">
                <FileText className="h-16 w-16 mx-auto mb-4 text-[#73cfd0]" />
                <h3 className="text-lg font-medium text-white mb-2">No documents yet</h3>
                <p className="text-[#73cfd0]/80 mb-4">Complete a consultation to generate your first mitigation statement.</p>
                <button
                  onClick={() => router.push('/chat')}
                  className="px-4 py-2 bg-[#73cfd0] text-black rounded-lg hover:bg-white hover:text-[#73cfd0] transition-colors"
                >
                  Start a Consultation
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {documents.map((document, idx) => (
                  <div
                    key={document.id}
                    ref={el => (cardsRef.current[idx] = el)}
                    className="bg-gradient-to-br from-[#2a4a5a] to-[#1a2332] shadow-xl rounded-2xl p-7 border border-[#73cfd0]/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#73cfd0]/20 text-[#73cfd0] group-hover:bg-[#73cfd0] group-hover:text-black transition-all duration-300 shadow">
                          {getStatusIcon(document.status)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            Mitigation Statement
                            {document.status === 'APPROVED' && <CheckCircle className="h-5 w-5 text-green-400" />}
                          </h3>
                          <p className="text-sm text-[#73cfd0]/80 mt-1">
                            Created on {new Date(document.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow border ${
                              document.status === 'PENDING_REVIEW' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                              document.status === 'APPROVED' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                              document.status === 'REJECTED' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                              'bg-[#73cfd0]/20 text-[#73cfd0] border-[#73cfd0]/30'
                            }`}>
                              {getStatusText(document.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedDocument(selectedDocument?.id === document.id ? null : document)}
                          className="p-2 text-[#73cfd0] hover:text-white transition-colors rounded-full hover:bg-[#73cfd0]/10"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                          {document.status === 'APPROVED' && (
                          <button
                            onClick={() => downloadDocument(document.id, `mitigation-statement-${document.id}.pdf`)}
                            className="p-2 text-[#73cfd0] hover:text-white transition-colors rounded-full hover:bg-[#73cfd0]/10"
                            title="Download"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {selectedDocument?.id === document.id && (
                      <div className="mt-4 pt-4 border-t border-[#73cfd0]/30">
                        <h4 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#73cfd0]" /> Document Preview
                        </h4>
                        <div className="bg-[#1a3a4a] rounded-lg p-4 max-h-64 overflow-y-auto border border-[#73cfd0]/20 shadow-inner">
                          <pre className="text-sm text-[#73cfd0]/90 whitespace-pre-wrap font-sans">
                            {document.content.length > 1000
                              ? document.content.substring(0, 1000) + '...'
                              : document.content
                            }
                          </pre>
                        </div>
                        {document.status === 'PENDING_REVIEW' && (
                          <p className="text-sm text-yellow-300/80 mt-2">
                            This document is currently under review by our legal team. You'll be notified once it's approved.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}