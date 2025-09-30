import Head from 'next/head';
import Link from 'next/link';
import { Layout, Footer } from '../../components';

export default function Privacy() {
    return (
        <Layout
            title="Privacy Policy - Harmonia-AI"
            description="Privacy Policy for Harmonia-AI - Your data privacy is our priority"
        >
            <div className="bg-gradient-to-br from-[#0f2b2f] via-[#1a2332] to-[#0f2b2f] flex flex-col items-center py-12 px-4 flex-1">
                <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-[#73cfd0]/20 p-8 sm:p-12">
                    <h1 className="text-3xl font-extrabold text-white mb-4">Privacy Policy</h1>
                    <p className="text-[#73cfd0] mb-8">Last updated: September 29, 2025</p>
                    <div className="prose prose-invert max-w-none text-white">
                        <h2>1. Information We Collect</h2>
                        <ul>
                            <li>Personal information you provide (name, email, etc.)</li>
                            <li>Usage data and cookies for analytics and security</li>
                        </ul>
                        <h2>2. How We Use Your Information</h2>
                        <ul>
                            <li>To provide and improve our services</li>
                            <li>To communicate with you about your account or service updates</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                        <h2>3. Data Security</h2>
                        <p>We use industry-standard security measures to protect your data. Sensitive data is encrypted and access is restricted.</p>
                        <h2>4. Data Retention</h2>
                        <p>We retain your data only as long as necessary to provide our services or as required by law. You may request deletion of your data at any time.</p>
                        <h2>5. Third-Party Services</h2>
                        <p>We do not sell your data. We may share data with trusted partners for essential services (e.g., payment processing) under strict confidentiality agreements.</p>
                        <h2>6. Your Rights</h2>
                        <ul>
                            <li>You may access, update, or delete your personal information at any time.</li>
                            <li>Contact us to exercise your rights or for any privacy concerns.</li>
                        </ul>
                        <h2>7. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy from time to time. Continued use of the service constitutes acceptance of the new policy.</p>
                        <h2>8. Contact</h2>
                        <p>If you have any questions, please <Link href="/contact">contact us</Link>.</p>
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    );
}
