import React, { useEffect } from 'react';
import { HeaderSection } from '../shared/HeaderSection/HeaderSection';
import { SEO } from '../SEO/SEO';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <SEO
        title="About"
        description="Learn about Copus — an open-web curation network that rewards curators and original creators for sharing valuable content."
      />
      <HeaderSection />

      <div className="max-w-3xl mx-auto px-6 py-32">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Who we are & why we've launched Copus
          </h1>

          <p className="text-gray-700 leading-relaxed mb-6">
            Hi everyone! We are the creators of Copus, a small team of Internet enthusiasts who have
            seen some of our most beloved websites fold up over the years, and we've been looking for
            a way to reverse this trend and keep great content thriving.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            We see that the way people interact with the Internet has changed. More and more people are
            consuming summarized content through AI without visiting the original websites. As a result,
            the ads-based business model that many creators and independent websites rely on is severely
            endangered. We believe that the open web is urgently in need of a new business model to survive.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            Over the past three years, we realized that finding quality content is becoming increasingly
            valuable in an increasingly noisy web. This is true for both humans and AI. So we came up with
            a solution: incentivizing people to find and share valuable content, with both the curator and
            the original creator getting rewarded. In this way, we make surfacing Internet gems a sustainable
            business that recognizes curators and creators for their great taste.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            To make this real, we launched{' '}
            <a href="/" className="text-red hover:underline font-medium">Copus.network</a>.
          </p>

          <hr className="border-gray-200 my-8" />

          {/* What is Copus */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">What is Copus</h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            Copus is a link curation space: you can collect quality content you've found, share it with
            other taste makers and give exposure to creators who you'd love to see continue their craft.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            Each visit to content that you have curated can add a small payment to your wallet and that of
            the content creator. Your curated links will also be stored in a block-chain meaning you will
            have access for life. We are the Internet's new collective treasure map.
          </p>

          <hr className="border-gray-200 my-8" />

          {/* Who is Copus for */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Who is Copus for?</h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            If you've been bookmarking over the years, you already have tons of Internet gems saved to your
            browser, Pinterest, Instagram, Are.na. Why not share the ones you feel have been the most
            underrated? Share with other like-minded readers and reward the creators in the same go.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            Were you a Pocket user? Save your top bookmarks here and never lose them. In the future, you'll
            be able to import all of your Pocket bookmarks.
          </p>

          <hr className="border-gray-200 my-8" />

          {/* Other good stuff */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Other good stuff about Copus</h2>

          <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-6 space-y-4">
            <li>
              <strong>Open source.</strong> You can see{' '}
              <a href="https://github.com/copus-io/copus-network" target="_blank" rel="noopener noreferrer" className="text-red hover:underline">
                behind the curtain
              </a>{' '}
              of what makes our platform so neat and secure, and to give you that extra peace of mind.
            </li>
            <li>
              <strong>Community governance.</strong> We plan to launch a governance token to put the ownership
              of the project into the hands of the people who use it. Our use of cryptocurrency ensures long
              term ownership and fairness to all of Copus's users and supporters.
            </li>
            <li>
              <strong>Creator-first revenue share.</strong> Revenue share for the original creator is set to
              50% right now. Our goal is to ensure that the original creator gets credit for their efforts and
              not the website or platform on which they publish.
            </li>
            <li>
              <strong>Privacy-respecting.</strong> We don't mess with rights and privacy. We won't sell your
              data to AI companies or advertisers.
            </li>
            <li>
              <strong>Growing community.</strong> Copus's Chinese version (Copus.io) is surging with users,
              particularly in the fan fiction space. We have become the new home for over 150k users.
            </li>
            <li>
              <strong>Sustainable business model.</strong> In this initial phase, we will be taking a small
              percentage of each payment and put unclaimed creator earnings into low-risk investments.
            </li>
          </ul>

          <hr className="border-gray-200 my-8" />

          <p className="text-gray-700 leading-relaxed mb-4">
            Have we caught your interest? Learn more about Copus by dropping us a question or comment
            at{' '}
            <a href="mailto:handuo@server31.io" className="text-red hover:underline">handuo@server31.io</a>.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Or{' '}
            <a href="/" className="text-red hover:underline font-medium">start sharing content today</a>!
          </p>

          <p className="text-sm text-gray-500 mt-8">
            &copy; 2026 S31 Labs. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
