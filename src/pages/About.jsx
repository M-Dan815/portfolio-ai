import React from "react";
import {Zap, Heart, Code, Users} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function About() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
			<Header />

			<main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					{/* Hero Section */}
					<div className="text-center mb-16">
						<h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
							About PortfolioAI
						</h1>
						<p className="text-xl text-gray-300 max-w-2xl mx-auto">
							We're on a mission to help professionals showcase their work
							beautifully, without the technical barriers.
						</p>
					</div>

					{/* Story Section */}
					<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 mb-12">
						<h2 className="text-3xl font-bold mb-4 text-white">Our Story</h2>
						<div className="space-y-4 text-gray-300">
							<p>
								PortfolioAI was born from a simple observation: too many
								talented professionals struggle to create an online presence
								that truly represents their skills and achievements.
							</p>
							<p>
								Traditional portfolio builders are either too complex, requiring
								coding knowledge, or too limiting, offering cookie-cutter
								templates that don't stand out. We knew there had to be a better
								way.
							</p>
							<p>
								By combining the power of AI with modern web design principles,
								we created a tool that generates beautiful, unique portfolio
								websites in seconds—all from your existing resume.
							</p>
						</div>
					</div>

					{/* Values */}
					<div className="mb-16">
						<h2 className="text-3xl font-bold mb-8 text-center text-white">
							Our Values
						</h2>
						<div className="grid md:grid-cols-2 gap-6">
							{[
								{
									icon: Zap,
									title: "Speed & Simplicity",
									desc: "Your time is valuable. We make portfolio creation effortless and instant.",
								},
								{
									icon: Heart,
									title: "Quality First",
									desc: "Every generated portfolio meets high standards of design and performance.",
								},
								{
									icon: Code,
									title: "Open & Accessible",
									desc: "We believe great tools should be accessible to everyone, regardless of budget.",
								},
								{
									icon: Users,
									title: "Community Driven",
									desc: "Built by developers, for professionals. Your feedback shapes our roadmap.",
								},
							].map((value, i) => (
								<div
									key={i}
									className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6"
								>
									<value.icon className="w-10 h-10 text-blue-400 mb-4" />
									<h3 className="text-xl font-bold mb-2 text-white">
										{value.title}
									</h3>
									<p className="text-gray-300">{value.desc}</p>
								</div>
							))}
						</div>
					</div>

					{/* Tech Stack */}
					<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 mb-12">
						<h2 className="text-3xl font-bold mb-6 text-white">
							Built with Modern Technology
						</h2>
						<p className="text-gray-300 mb-6">
							PortfolioAI is powered by cutting-edge AI and modern web
							technologies to deliver the best possible experience.
						</p>
						<div className="flex flex-wrap gap-3">
							{[
								"AI/ML",
								"React",
								"FastAPI",
								"MongoDB",
								"TailwindCSS",
								"Python",
							].map((tech, i) => (
								<span
									key={i}
									className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium"
								>
									{tech}
								</span>
							))}
						</div>
					</div>

					{/* CTA */}
					<div className="text-center">
						<h2 className="text-3xl font-bold mb-4 text-white">
							Ready to Get Started?
						</h2>
						<p className="text-gray-300 mb-8">
							Join thousands of professionals who've already created their
							stunning portfolios.
						</p>
						<a
							href="/"
							className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
						>
							Create Your Portfolio
						</a>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
