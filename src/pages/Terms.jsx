import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Terms() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
			<Header />

			<main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
						Terms of Service
					</h1>
					<p className="text-gray-400 mb-8">
						Last updated: {new Date().toLocaleDateString()}
					</p>

					<div className="space-y-8">
						<Section title="Agreement to Terms">
							<p>
								By accessing or using PortfolioAI, you agree to be bound by
								these Terms of Service and all applicable laws and regulations.
								If you do not agree with any of these terms, you are prohibited
								from using this service.
							</p>
						</Section>

						<Section title="Use License">
							<p className="mb-4">
								Permission is granted to temporarily use PortfolioAI for
								personal and commercial portfolio creation, subject to the
								following restrictions:
							</p>
							<ul className="list-disc list-inside space-y-2">
								<li>
									You must not modify or copy the materials except for personal
									use
								</li>
								<li>
									You must not use the materials for any commercial purpose
									without attribution
								</li>
								<li>
									You must not attempt to reverse engineer any software
									contained on PortfolioAI
								</li>
								<li>
									You must not remove any copyright or proprietary notations
									from the materials
								</li>
							</ul>
						</Section>

						<Section title="User Accounts">
							<p className="mb-4">
								When you create an account with us, you must provide accurate,
								complete, and current information. You are responsible for:
							</p>
							<ul className="list-disc list-inside space-y-2">
								<li>Maintaining the security of your account credentials</li>
								<li>All activities that occur under your account</li>
								<li>Notifying us immediately of any unauthorized access</li>
							</ul>
						</Section>

						<Section title="Content Ownership">
							<h3 className="text-lg font-semibold text-white mb-2">
								Your Content
							</h3>
							<p className="mb-4">
								You retain all rights to the content you upload (resumes, CVs).
								By uploading content, you grant us a license to process and
								generate portfolios from your content.
							</p>

							<h3 className="text-lg font-semibold text-white mb-2">
								Generated Portfolios
							</h3>
							<p>
								You own the portfolios generated from your content. You may use,
								modify, and distribute them freely. We retain the right to
								showcase anonymized examples for marketing purposes.
							</p>
						</Section>

						<Section title="Acceptable Use">
							<p className="mb-4">You agree not to:</p>
							<ul className="list-disc list-inside space-y-2">
								<li>Upload malicious code or viruses</li>
								<li>Abuse, harass, or harm other users</li>
								<li>Violate any applicable laws or regulations</li>
								<li>Infringe on intellectual property rights</li>
								<li>Attempt to gain unauthorized access to our systems</li>
								<li>Use the service for spam or unsolicited marketing</li>
							</ul>
						</Section>

						<Section title="Service Availability">
							<p>
								We strive to provide uninterrupted service, but we do not
								guarantee that:
							</p>
							<ul className="list-disc list-inside space-y-2 mt-4">
								<li>The service will be available at all times</li>
								<li>The service will be error-free</li>
								<li>Defects will be corrected immediately</li>
								<li>The service will meet your specific requirements</li>
							</ul>
						</Section>

						<Section title="Pricing and Payments">
							<p>
								PortfolioAI is currently free to use. We reserve the right to
								introduce paid features in the future. Existing users will be
								notified of any pricing changes with reasonable advance notice.
							</p>
						</Section>

						<Section title="Termination">
							<p className="mb-4">
								We may terminate or suspend your account immediately, without
								prior notice, for conduct that we believe:
							</p>
							<ul className="list-disc list-inside space-y-2">
								<li>Violates these Terms of Service</li>
								<li>Is harmful to other users or our business</li>
								<li>Exposes us to legal liability</li>
							</ul>
							<p className="mt-4">
								You may also terminate your account at any time from your
								account settings.
							</p>
						</Section>

						<Section title="Limitation of Liability">
							<p>
								PortfolioAI and its creators shall not be liable for any
								indirect, incidental, special, consequential, or punitive
								damages, including loss of profits, data, or other intangible
								losses, resulting from your use or inability to use the service.
							</p>
						</Section>

						<Section title="Disclaimer">
							<p>
								The service is provided "as is" without warranties of any kind,
								either express or implied. We do not warrant that the service
								will be uninterrupted, secure, or error-free.
							</p>
						</Section>

						<Section title="Changes to Terms">
							<p>
								We reserve the right to modify these terms at any time. We will
								notify users of any material changes via email or through the
								service. Your continued use after such modifications constitutes
								acceptance of the updated terms.
							</p>
						</Section>

						<Section title="Governing Law">
							<p>
								These terms shall be governed by and construed in accordance
								with the laws of your jurisdiction, without regard to conflict
								of law provisions.
							</p>
						</Section>

						<Section title="Contact Information">
							<p>
								For questions about these Terms of Service, please contact us
								at:
							</p>
							<p className="mt-4">
								Email:{" "}
								<a
									href="mailto:legal@portfolioai.com"
									className="text-blue-400 hover:text-blue-300"
								>
									legal@portfolioai.com
								</a>
							</p>
						</Section>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}

function Section({title, children}) {
	return (
		<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
			<h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
			<div className="text-gray-300 space-y-4">{children}</div>
		</div>
	);
}
