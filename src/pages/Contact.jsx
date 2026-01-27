import React, {useState} from "react";
import {Mail, MessageSquare, Send, Github, Twitter} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Contact() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		// Handle form submission here
		console.log("Form submitted:", formData);
		setSubmitted(true);
		setTimeout(() => setSubmitted(false), 3000);
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
			<Header />

			<main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
				<div className="max-w-5xl mx-auto">
					{/* Header */}
					<div className="text-center mb-16">
						<h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
							Get in Touch
						</h1>
						<p className="text-xl text-gray-300">
							Have a question or feedback? We'd love to hear from you.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8">
						{/* Contact Form */}
						<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
							<h2 className="text-2xl font-bold mb-6 text-white">
								Send us a message
							</h2>

							{submitted && (
								<div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
									Message sent successfully! We'll get back to you soon.
								</div>
							)}

							<form onSubmit={handleSubmit} className="space-y-6">
								<div>
									<label className="block text-sm font-medium text-white mb-2">
										Name
									</label>
									<input
										type="text"
										name="name"
										value={formData.name}
										onChange={handleChange}
										required
										className="w-full px-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
										placeholder="Your name"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-white mb-2">
										Email
									</label>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										required
										className="w-full px-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
										placeholder="your.email@example.com"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-white mb-2">
										Subject
									</label>
									<input
										type="text"
										name="subject"
										value={formData.subject}
										onChange={handleChange}
										required
										className="w-full px-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
										placeholder="What's this about?"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-white mb-2">
										Message
									</label>
									<textarea
										name="message"
										value={formData.message}
										onChange={handleChange}
										required
										rows={5}
										className="w-full px-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all resize-none"
										placeholder="Tell us more..."
									/>
								</div>

								<button
									type="submit"
									className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center"
								>
									<Send className="w-5 h-5 mr-2" />
									Send Message
								</button>
							</form>
						</div>

						{/* Contact Info */}
						<div className="space-y-6">
							{/* Email */}
							<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
								<Mail className="w-10 h-10 text-blue-400 mb-4" />
								<h3 className="text-xl font-bold mb-2 text-white">Email Us</h3>
								<p className="text-gray-300 mb-4">
									For general inquiries and support
								</p>
								<a
									href="mailto:contact@portfolioai.com"
									className="text-blue-400 hover:text-blue-300 transition-colors"
								>
									contact@portfolioai.com
								</a>
							</div>

							{/* Support */}
							<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
								<MessageSquare className="w-10 h-10 text-blue-400 mb-4" />
								<h3 className="text-xl font-bold mb-2 text-white">Support</h3>
								<p className="text-gray-300 mb-4">
									Need help? Check our documentation or reach out
								</p>
								<a
									href="mailto:support@portfolioai.com"
									className="text-blue-400 hover:text-blue-300 transition-colors"
								>
									support@portfolioai.com
								</a>
							</div>

							{/* Social */}
							<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
								<h3 className="text-xl font-bold mb-4 text-white">
									Connect With Us
								</h3>
								<div className="flex space-x-4">
									<a
										href="https://github.com"
										target="_blank"
										rel="noopener noreferrer"
										className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
										aria-label="GitHub"
									>
										<Github className="w-6 h-6 text-white" />
									</a>
									<a
										href="https://twitter.com"
										target="_blank"
										rel="noopener noreferrer"
										className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
										aria-label="Twitter"
									>
										<Twitter className="w-6 h-6 text-white" />
									</a>
								</div>
							</div>

							{/* Response Time */}
							<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
								<p className="text-sm text-white">
									<strong>Response Time:</strong> We typically respond within
									24-48 hours during business days.
								</p>
							</div>
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
