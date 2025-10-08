import Head from 'next/head';
import Link from 'next/link';
import { Layout, Footer } from '../../components';

export default function Terms() {
  return (
    <Layout
      title="Terms and Conditions - StreetLegal-AI"
      description="Terms and Conditions for StreetLegal-AI - Please read carefully"
    >
      <div className="bg-gradient-to-br from-[#0f2b2f] via-[#1a2332] to-[#0f2b2f] flex flex-col items-center py-12 px-4 flex-1">
        <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-[#73cfd0]/20 p-8 sm:p-12">
          <h1 className="text-3xl font-extrabold text-white mb-4">Terms & Conditions</h1>
          <p className="text-[#73cfd0] mb-8">Last updated: September 29, 2025</p>
          <div className="prose prose-invert max-w-none text-white">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using StreetLegal-AI, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our service.</p>
            <h2>2. Service Description</h2>
            <p>StreetLegal-AI provides AI-powered legal mitigation statement generation and related services. All statements are subject to review by a qualified solicitor before delivery.</p>
            <h2>3. User Responsibilities</h2>
            <ul>
              <li>You must provide accurate and complete information.</li>
              <li>You are responsible for maintaining the confidentiality of your account.</li>
              <li>You may not use the service for unlawful purposes.</li>
            </ul>
            <h2>4. Payment & Refunds</h2>
            <p>All payments are processed securely. Refunds are provided at our discretion and only if the service has not been delivered.</p>
            <h2>5. Intellectual Property</h2>
            <p>All content, trademarks, and data on this site are the property of StreetLegal-AI or its licensors.</p>
            <h2>6. Limitation of Liability</h2>
            <p>StreetLegal-AI is not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
            <h2>7. Changes to Terms</h2>
            <p>We may update these Terms & Conditions at any time. Continued use of the service constitutes acceptance of the new terms.</p>
            <h2>8. Contact</h2>
            <p>If you have any questions, please <Link href="/contact">contact us</Link>.</p>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
