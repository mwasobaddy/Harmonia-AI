import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, LoadingSpinner } from '../../components';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import {
  FileText,
  Download,
  Eye,
  Search,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const statusConfig = {
  DRAFT: { color: 'bg-gray-100 text-gray-800', icon: Clock },
  PENDING_REVIEW: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();
  const { isLoggedIn, loading, user } = useAuth();

  // Animation refs
  const documentsRef = useRef(null);

  // Load documents
  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      loadDocuments();
    }
  }, [isLoggedIn, user]);

  // Animate in on mount
  useEffect(() => {
    if (documentsRef.current && !loading && isLoggedIn && user?.role === 'admin') {
      gsap.fromTo(
        documentsRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );
    }
  }, [loading, isLoggedIn, user, documents]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);

      // Fetch all documents (admin endpoint)
      const response = await fetch('http://localhost:5000/api/documents/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        console.error('Failed to load documents');
        toast.error('Failed to load documents');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Error loading documents');
    } finally {
      setIsLoading(false);
    }
  };

  const updateDocumentStatus = async (documentId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${documentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success('Document status updated successfully');
        loadDocuments(); // Reload documents
      } else {
        toast.error('Failed to update document status');
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      toast.error('Error updating document status');
    }
  };

  const downloadDocument = async (documentId, filename) => {
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error('Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Error downloading document');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStats = () => {
    const stats = {};
    documents.forEach(doc => {
      stats[doc.status] = (stats[doc.status] || 0) + 1;
    });
    return stats;
  };

  const statusStats = getStatusStats();

  if (isLoading) {
    return (
      <AdminLayout title="Documents" description="Manage all system documents">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Documents" description="Manage all system documents">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Document Management</h1>
          <p className="text-[#73cfd0]">Review and manage all generated documents</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-[#73cfd0]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-[#73cfd0]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#73cfd0] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="flex gap-4">
            {Object.entries(statusStats).map(([status, count]) => (
              <div key={status} className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-[#73cfd0]/20">
                <div className="text-[#73cfd0] text-sm font-medium capitalize">
                  {status.replace('_', ' ').toLowerCase()}
                </div>
                <div className="text-white text-xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Table */}
        <div
          ref={documentsRef}
          className="bg-white/10 backdrop-blur-lg rounded-xl border border-[#73cfd0]/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f2b2f]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#73cfd0] uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#73cfd0] uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#73cfd0] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#73cfd0] uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#73cfd0] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#73cfd0]/10">
                {filteredDocuments.map((doc) => {
                  const StatusIcon = statusConfig[doc.status]?.icon || FileText;
                  return (
                    <tr key={doc.id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-[#73cfd0] mr-3" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              {doc.title || `Document ${doc.id.slice(-8)}`}
                            </div>
                            <div className="text-sm text-gray-400">
                              {doc.type || 'Legal Document'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-white">
                              {doc.user?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {doc.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[doc.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {doc.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadDocument(doc.id, doc.filename || `document-${doc.id}.pdf`)}
                            className="text-[#73cfd0] hover:text-white transition-colors duration-200"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {doc.status === 'PENDING_REVIEW' && (
                            <>
                              <button
                                onClick={() => updateDocumentStatus(doc.id, 'APPROVED')}
                                className="text-green-400 hover:text-green-300 transition-colors duration-200"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateDocumentStatus(doc.id, 'REJECTED')}
                                className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'No documents have been generated yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}