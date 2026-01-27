import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Privacy() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
			<Header />

			<main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
						Privacy Policy
					</h1>
					<p className="text-gray-400 mb-8">
						Last updated: {new Date().toLocaleDateString()}
					</p>

					<div className="space-y-8">
						<Section title="Introduction">
							<p>
								Welcome to PortfolioAI. We respect your privacy and are
								committed to protecting your personal data. This privacy policy
								explains how we collect, use, and safeguard your information
								when you use our service.
							</p>
						</Section>

						<Section title="Information We Collect">
							<h3 className="text-lg font-semibold text-white mb-2">
								Personal Information
							</h3>
							<ul className="list-disc list-inside space-y-2 mb-4">
								<li>Email address</li>
								<li>Name (optional)</li>
								<li>Account credentials</li>
							</ul>

							<h3 className="text-lg font-semibold text-white mb-2">
								Resume/CV Data
							</h3>
							<ul className="list-disc list-inside space-y-2 mb-4">
								<li>Content of uploaded CV/resume files</li>
								<li>Generated portfolio data</li>
								<li>File metadata (name, size, upload time)</li>
							</ul>

							<h3 className="text-lg font-semibold text-white mb-2">
								Usage Information
							</h3>
							<ul className="list-disc list-inside space-y-2">
								<li>Browser type and version</li>
								<li>Device information</li>
								<li>IP address</li>
								<li>Pages visited and time spent</li>
							</ul>
						</Section>

						<Section title="How We Use Your Information">
							<ul className="list-disc list-inside space-y-2">
								<li>To generate and host your portfolio websites</li>
								<li>To provide and maintain our service</li>
								<li>To notify you about changes to our service</li>
								<li>To provide customer support</li>
								<li>To improve our service based on usage patterns</li>
								<li>To detect and prevent technical issues</li>
							</ul>
						</Section>

						<Section title="Data Storage and Security">
							<p className="mb-4">
								We implement appropriate security measures to protect your
								personal information:
							</p>
							<ul className="list-disc list-inside space-y-2">
								<li>Encrypted data transmission (SSL/TLS)</li>
								<li>Secure database storage</li>
								<li>Regular security audits</li>
								<li>Access controls and authentication</li>
							</ul>
						</Section>

						<Section title="Data Retention">
							<p>
								We retain your personal data only for as long as necessary to
								provide our services and comply with legal obligations. You can
								request deletion of your account and associated data at any
								time.
							</p>
						</Section>

						<Section title="Your Rights">
							<p className="mb-4">You have the right to:</p>
							<ul className="list-disc list-inside space-y-2">
								<li>Access your personal data</li>
								<li>Correct inaccurate data</li>
								<li>Request deletion of your data</li>
								<li>Export your data</li>
								<li>Withdraw consent at any time</li>
							</ul>
						</Section>

						<Section title="Cookies">
							<p>
								We use essential cookies to maintain your session and
								preferences. We do not use third-party tracking cookies.
							</p>
						</Section>

						<Section title="Third-Party Services">
							<p className="mb-4">We use the following third-party services:</p>
							<ul className="list-disc list-inside space-y-2">
								<li>
									<strong>AI Service Provider:</strong> For generating portfolio
									content
								</li>
								<li>
									<strong>Cloud Storage:</strong> For hosting portfolios
								</li>
							</ul>
							<p className="mt-4">
								These services have their own privacy policies governing their
								use of your information.
							</p>
						</Section>

						<Section title="Changes to This Policy">
							<p>
								We may update this privacy policy from time to time. We will
								notify you of any changes by posting the new policy on this page
								and updating the "Last updated" date.
							</p>
						</Section>

						<Section title="Contact Us">
							<p>
								If you have questions about this privacy policy, please contact
								us at:
							</p>
							<p className="mt-4">
								Email:{" "}
								<a
									href="mailto:privacy@portfolioai.com"
									className="text-blue-400 hover:text-blue-300"
								>
									privacy@portfolioai.com
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
