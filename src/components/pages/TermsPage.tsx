import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeaderSection } from '../shared/HeaderSection/HeaderSection';
import { SEO } from '../SEO/SEO';

export const TermsPage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // If accessed via /privacy, scroll to the privacy section
    if (location.pathname === '/privacy') {
      const el = document.getElementById('privacy-policy');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const isPrivacyRoute = location.pathname === '/privacy';

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <SEO
        title={isPrivacyRoute ? 'Privacy Policy' : 'Terms of Service'}
        description="Copus Terms of Service and Privacy Policy. Learn about how we handle your data and the rules governing your use of our platform."
        url="https://copus.network/terms"
      />
      <HeaderSection />

      <div className="max-w-3xl mx-auto px-6 py-32">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Terms & Privacy
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Last updated: January 20th, 2026
          </p>

          <p className="text-gray-700 leading-relaxed mb-8">
            Welcome to Copus.io & Copus.network ("Copus", "we", "our", or "us"). These Terms of
            Service ("Terms") govern your access to and use of our website, products, services,
            browser extensions, and applications (collectively, the "Services"). Please read these
            Terms carefully before using the Services. By accessing or using the Services, you agree
            to be bound by these Terms on behalf of yourself or any entity you represent.
          </p>

          <hr className="border-gray-200 my-8" />

          {/* Section 1 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">1. Eligibility</h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            To use the Services, you must be at least 18 years old or of legal age in your
            jurisdiction. By using the Services, you represent that you meet these requirements.
          </p>

          <hr className="border-gray-200 my-8" />

          {/* Section 2 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">2. Changes to Terms and Communications</h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            We may modify these Terms at any time. Any changes will be posted on this page with an
            updated revision date. Continued use of the Services after changes become effective
            indicates your agreement to the revised Terms. You agree to receive communications
            from us electronically, including notices, agreements, and other information.
          </p>

          <hr className="border-gray-200 my-8" />

          {/* Section 3 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            To access certain features, you must create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-8 space-y-2">
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Promptly update your information if it changes</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>

          <hr className="border-gray-200 my-8" />

          {/* Section 4 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">4. User Content</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You retain ownership of content you create and share through Copus. By posting content, you grant us a
            non-exclusive, worldwide, royalty-free license to host, display, distribute, and promote your content
            in connection with the Services. You represent that you have the necessary rights to share any content
            you post.
          </p>
          <p className="text-gray-700 leading-relaxed mb-8">
            You agree not to post content that is unlawful, harmful, threatening, abusive, harassing, defamatory,
            vulgar, obscene, or otherwise objectionable. We reserve the right to remove content that violates
            these Terms.
          </p>

          <hr className="border-gray-200 my-8" />

          {/* Section 5 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">5. Curation and Treasury</h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            Copus enables users to curate web content into personal collections called "Treasuries."
            Curated content remains attributed to its original source. Users are responsible for
            ensuring their curation practices respect the rights of original content creators.
          </p>

          <hr className="border-gray-200 my-8" />

          {/* Section 6 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">6. Browser Extension</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Copus browser extension enhances your browsing experience by allowing you to save
            and curate content. The extension:
          </p>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-8 space-y-2">
            <li>Accesses page content on the current tab to enable saving and curation features</li>
            <li>Syncs your authentication state with copus.network so you stay logged in across tabs</li>
            <li>Stores your preferences and authentication token locally in your browser</li>
            <li>Does not collect passwords, cookies, or any credentials beyond the session token you create by logging in to copus.network</li>
          </ul>

          <hr className="border-gray-200 my-8" />

          {/* Section 7 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            The Copus platform, including its design, logos, trademarks, and software, is the property of
            S31 Labs. You may not copy, modify, distribute, or reverse-engineer any part of the Services
            without our prior written consent. Open-source components are governed by their respective licenses.
          </p>

          <hr className="border-gray-200 my-8" />

          {/* Section 8 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">8. Payments and Earnings</h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            Certain features may involve payments or earnings. All transactions are processed through
            third-party payment providers. We are not responsible for payment processing errors by
            third parties. Earnings are subject to our platform policies and may be modified at our discretion.
          </p>

          <hr className="border-gray-200 my-8" />

          {/* Section 9 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">9. Prohibited Conduct</h2>
          <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-8 space-y-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Use the Services for unauthorized commercial purposes</li>
            <li>Attempt to interfere with or compromise the integrity of the Services</li>
            <li>Use automated means to access the Services without permission</li>
            <li>Impersonate any person or entity</li>
          </ul>

          <hr className="border-gray-200 my-8" />

          {/* Section 10 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">10. Termination</h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            We may suspend or terminate your account at any time for violations of these Terms or for any
            other reason at our sole discretion. You may delete your account at any time through the account
            settings. Upon termination, your right to use the Services will immediately cease.
          </p>

          <hr className="border-gray-200 my-8" />

          {/* Section 11 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">11. Disclaimers</h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            The Services are provided "as is" and "as available" without warranties of any kind, either express
            or implied. We do not warrant that the Services will be uninterrupted, error-free, or secure.
            Your use of the Services is at your sole risk.
          </p>

          <hr className="border-gray-200 my-8" />

          {/* Section 12 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">12. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            To the maximum extent permitted by law, Copus and its affiliates shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages, or any loss of profits
            or revenues, whether incurred directly or indirectly.
          </p>

          <hr className="border-gray-200 my-8" />

          {/* Privacy Policy */}
          <div id="privacy-policy" className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h2>

            <p className="text-gray-700 leading-relaxed mb-8">
              This Privacy Policy describes how Copus collects, uses, and protects your information
              when you use our Services. Your privacy is important to us, and we are committed to
              handling your data responsibly.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mb-3">Information We Collect</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-8 space-y-2">
              <li><strong>Account information:</strong> email address, username, and password (stored as a hash)</li>
              <li><strong>Profile information:</strong> display name, avatar, bio, and social links you choose to add</li>
              <li><strong>Content:</strong> articles, curated links, treasury collections, and comments you create</li>
              <li><strong>Wallet address:</strong> if you choose to connect a Web3 wallet for payments</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mb-3">Information Collected Automatically</h3>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-8 space-y-2">
              <li><strong>Usage data:</strong> pages visited, features used, and interactions with content</li>
              <li><strong>Device information:</strong> browser type, operating system, and screen resolution</li>
              <li><strong>Log data:</strong> IP address, access times, and referring URLs</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mb-3">Browser Extension Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Copus browser extension collects minimal data necessary for its functionality:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-8 space-y-2">
              <li>Page URL and title when you explicitly choose to save content</li>
              <li>Your authentication token (synced from copus.network, not independently collected)</li>
              <li>Extension preferences stored locally in your browser</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-8">
              The extension does <strong>not</strong> collect browsing history, passwords, cookies, form data,
              or any information from pages you do not actively choose to interact with through the extension.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mb-3">How We Use Your Information</h3>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-8 space-y-2">
              <li>To provide, maintain, and improve the Services</li>
              <li>To process your transactions and manage your account</li>
              <li>To send you service-related notifications</li>
              <li>To personalize your content discovery experience</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mb-3">Data Sharing</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-8 space-y-2">
              <li>With your consent or at your direction</li>
              <li>With service providers who assist in operating the platform (e.g., hosting, payment processing)</li>
              <li>To comply with legal obligations or respond to lawful requests</li>
              <li>To protect the rights, property, or safety of Copus, our users, or the public</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mb-3">Data Security</h3>
            <p className="text-gray-700 leading-relaxed mb-8">
              We implement appropriate technical and organizational measures to protect your personal
              information. However, no method of transmission over the internet is 100% secure, and
              we cannot guarantee absolute security.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mb-3">Data Retention</h3>
            <p className="text-gray-700 leading-relaxed mb-8">
              We retain your information for as long as your account is active or as needed to provide
              the Services. You may request deletion of your account and associated data through the
              account settings or by contacting us.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mb-3">Your Rights</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-8 space-y-2">
              <li>Access, correct, or delete your personal information</li>
              <li>Object to or restrict processing of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mb-3">Children's Privacy</h3>
            <p className="text-gray-700 leading-relaxed mb-8">
              The Services are not intended for children under 18 years of age. We do not knowingly
              collect personal information from children.
            </p>
          </div>

          <hr className="border-gray-200 my-8" />

          {/* Section 13 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions about these Terms or our Privacy Policy, please contact us at:
          </p>
          <ul className="list-none text-gray-700 leading-relaxed mb-4 space-y-1">
            <li>Email: <a href="mailto:handuo@server31.io" className="text-red hover:underline">handuo@server31.io</a></li>
            <li>GitHub: <a href="https://github.com/copus-io/copus-network" target="_blank" rel="noopener noreferrer" className="text-red hover:underline">github.com/copus-io/copus-network</a></li>
          </ul>

          <p className="text-sm text-gray-500 mt-8">
            &copy; 2026 S31 Labs. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
