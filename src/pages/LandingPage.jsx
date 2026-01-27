import React, {useState, useEffect} from "react";
import {
	Menu,
	X,
	Upload,
	Zap,
	Palette,
	Lock,
	CheckCircle,
	Star,
	ArrowRight,
	Play,
	ChevronDown,
} from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {Link} from "react-router";

export default function LandingPage() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("All Themes");

	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 50);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const themes = [
		{
			name: "Developer Portfolio",
			tag: "Popular",
			category: "Minimal",
			desc: "Clean, code-focused design perfect for showcasing your technical projects and skills",
		},
		{
			name: "Creative Showcase",
			tag: "New",
			category: "Creative",
			desc: "Bold, visual-first layout ideal for designers and creative professionals",
		},
		{
			name: "Minimalist",
			tag: "Classic",
			category: "Professional",
			desc: "Timeless, elegant design that lets your work speak for itself",
		},
		{
			name: "Dark Mode Pro",
			tag: "Modern",
			category: "Professional",
			desc: "Sleek dark theme with high contrast for maximum readability",
		},
	];

	const features = [
		{
			icon: Zap,
			title: "Instant Generation",
			desc: "Get your portfolio ready in under 30 seconds with our advanced AI technology. No coding required.",
			metric: "30s Average generation time",
		},
		{
			icon: Palette,
			title: "Full Customization",
			desc: "Edit every section, change colors, fonts, and layouts to match your personal brand perfectly.",
			metric: null,
		},
		{
			icon: CheckCircle,
			title: "Responsive Design",
			desc: "Your portfolio looks perfect on all devices - desktop, tablet, and mobile with zero extra effort.",
			metric: null,
		},
		{
			icon: Lock,
			title: "SSL Secured",
			desc: "All portfolios come with free SSL certificates for secure, encrypted browsing experience.",
			metric: null,
		},
	];

	const testimonials = [
		{
			name: "Sarah Johnson",
			role: "Product Designer at Google",
			initial: "SJ",
			quote:
				"PortfolioAI transformed my job search. Within minutes, I had a professional portfolio that impressed every recruiter I shared it with.",
		},
		{
			name: "Michael Chen",
			role: "Senior Engineer at Meta",
			initial: "MC",
			quote:
				"As a developer, I always put off making a portfolio. This tool made it incredibly easy - upload resume, pick a theme, done!",
		},
		{
			name: "Emily Parker",
			role: "Marketing Director at Spotify",
			initial: "EP",
			quote:
				"The AI understood my experience perfectly and created a portfolio that truly represents my professional journey. Highly recommend!",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
			{/* Navigation */}
			<Header />

			{/* Hero Section */}
			<section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-5xl mx-auto text-center">
					<div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8 backdrop-blur-sm">
						<Zap className="w-4 h-4 text-blue-400 mr-2" />
						<span className="text-sm text-blue-300">
							AI-Powered Portfolio Generation
						</span>
					</div>

					<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
						Transform Your Resume Into a Stunning Portfolio
					</h1>

					<p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
						Upload your CV and watch AI create a beautiful, professional
						portfolio website in seconds. Choose from modern designs, customize
						every detail, and share your work with the world.
					</p>

					{/* Stats */}
					<div className="flex flex-wrap justify-center gap-8 mb-12">
						<div className="flex items-center space-x-2">
							<CheckCircle className="w-5 h-5 text-green-400" />
							<span className="text-gray-300">50K+ Portfolios Created</span>
						</div>
						<div className="flex items-center space-x-2">
							<Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
							<span className="text-gray-300">4.9★ User Rating</span>
						</div>
						<div className="flex items-center space-x-2">
							<Zap className="w-5 h-5 text-blue-400" />
							<span className="text-gray-300">30s Average Time</span>
						</div>
					</div>

					{/* Trusted By */}
					<div className="border-t border-white/10 pt-12">
						<p className="text-sm text-gray-500 mb-6">
							Trusted by professionals at
						</p>
						<div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
							<span className="text-2xl font-bold">Google</span>
							<span className="text-2xl font-bold">Meta</span>
							<span className="text-2xl font-bold">Apple</span>
							<span className="text-2xl font-bold">Netflix</span>
							<span className="text-2xl font-bold">Spotify</span>
						</div>
					</div>

					{/* Features Banner */}
					<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
						<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm">
							<Lock className="w-8 h-8 mb-3 text-blue-400" />
							<p className="text-sm text-gray-400 mb-1">
								🔒 yourname.portfolioai.com
							</p>
						</div>
						<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm">
							<CheckCircle className="w-8 h-8 mb-3 text-green-400" />
							<p className="text-sm font-semibold mb-1">SEO Optimized</p>
							<p className="text-xs text-gray-400">Rank higher on Google</p>
						</div>
						<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm">
							<Zap className="w-8 h-8 mb-3 text-yellow-400" />
							<p className="text-sm font-semibold mb-1">Lightning Fast</p>
							<p className="text-xs text-gray-400">99.9% Uptime</p>
						</div>
					</div>

					<div className="mt-16 flex justify-center">
						<ChevronDown className="w-8 h-8 text-gray-500 animate-bounce" />
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section id="how" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<p className="text-blue-400 mb-2">Simple Process</p>
						<h2 className="text-4xl sm:text-5xl font-bold mb-4">
							How It Works
						</h2>
						<p className="text-gray-400">
							Three simple steps to your professional portfolio website
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{[
							{
								num: "01",
								title: "Upload Your Resume",
								desc: "Simply drag and drop your resume or CV. We support PDF, DOCX, and TXT formats with instant parsing.",
							},
							{
								num: "02",
								title: "AI Generates Portfolio",
								desc: "Our advanced AI analyzes your resume and creates a stunning portfolio with all your information beautifully organized.",
							},
							{
								num: "03",
								title: "Get Your Live Link",
								desc: "Customize your portfolio, choose a theme, add your personal touch, and get an instant shareable live link.",
							},
						].map((step, i) => (
							<div key={i} className="relative group">
								<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/40 transition-all">
									<div className="text-6xl font-bold text-blue-500/20 mb-4">
										{step.num}
									</div>
									<h3 className="text-2xl font-bold mb-4">{step.title}</h3>
									<p className="text-gray-400">{step.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Themes */}
			<section id="themes" className="py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<p className="text-blue-400 mb-2">Beautiful Designs</p>
						<h2 className="text-4xl sm:text-5xl font-bold mb-4">
							Choose Your Style
						</h2>
						<p className="text-gray-400">
							Handcrafted themes designed for personal portfolios
						</p>
					</div>

					<div className="flex justify-center gap-4 mb-12 flex-wrap">
						{["All Themes", "Minimal", "Creative", "Professional"].map(
							(tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`px-6 py-2 rounded-lg transition-all ${activeTab === tab ? "bg-blue-600 text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}
								>
									{tab}
								</button>
							),
						)}
					</div>

					<div className="grid md:grid-cols-2 gap-8">
						{themes.map((theme, i) => (
							<div
								key={i}
								className="group relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all"
							>
								<div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
									<Palette className="w-16 h-16 text-blue-400/50" />
								</div>
								<div className="p-6">
									<div className="flex items-center justify-between mb-2">
										<h3 className="text-xl font-bold">{theme.name}</h3>
										<span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
											{theme.tag}
										</span>
									</div>
									<p className="text-gray-400 mb-4">{theme.desc}</p>
									<button className="text-blue-400 hover:text-blue-300 inline-flex items-center">
										Preview Theme <ArrowRight className="w-4 h-4 ml-2" />
									</button>
								</div>
							</div>
						))}
					</div>

					<div className="text-center mt-12">
						<button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
							View All Themes
						</button>
					</div>
				</div>
			</section>

			{/* Features */}
			<section
				id="features"
				className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50"
			>
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<p className="text-blue-400 mb-2">Why Choose Us</p>
						<h2 className="text-4xl sm:text-5xl font-bold mb-4">
							Powerful Features
						</h2>
						<p className="text-gray-400">
							Everything you need to create an impressive online presence
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						{features.map((feature, i) => (
							<div
								key={i}
								className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm hover:border-blue-500/40 transition-all"
							>
								<feature.icon className="w-10 h-10 text-blue-400 mb-4" />
								<h3 className="text-lg font-bold mb-2">{feature.title}</h3>
								<p className="text-sm text-gray-400 mb-3">{feature.desc}</p>
								{feature.metric && (
									<p className="text-xs text-blue-400">{feature.metric}</p>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Pricing */}
			<section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<p className="text-blue-400 mb-2">Free & Open Source</p>
						<h2 className="text-4xl sm:text-5xl font-bold mb-4">
							Built for Everyone
						</h2>
						<p className="text-gray-400 mb-8">
							Create beautiful portfolios without any cost or limitations
						</p>
					</div>

					<div className="max-w-2xl mx-auto">
						<div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500 shadow-2xl shadow-blue-500/20 rounded-2xl p-8 backdrop-blur-sm">
							<div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-semibold">
								Always Free
							</div>
							<h3 className="text-2xl font-bold mb-2 text-center">
								Personal Portfolio
							</h3>
							<p className="text-gray-400 mb-6 text-center">
								Everything you need to showcase your work
							</p>
							<div className="mb-8 text-center">
								<span className="text-5xl font-bold">$0</span>
								<span className="text-gray-400"> forever</span>
							</div>
							<ul className="space-y-4 mb-8">
								<li className="flex items-start">
									<CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
									<span>Unlimited portfolio websites</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
									<span>All themes and designs included</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
									<span>Custom domain support</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
									<span>Full customization options</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
									<span>Export & download your code</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
									<span>No branding or watermarks</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
									<span>Community support</span>
								</li>
							</ul>
							<Link to="/dashboard">
								<button className="w-full py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
									Get Started Free
								</button>
							</Link>
						</div>
					</div>

					<div className="mt-12 text-center">
						<p className="text-gray-400 mb-4">
							Open source and community-driven
						</p>
						<div className="flex justify-center gap-6 flex-wrap">
							<a
								href="#"
								className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center"
							>
								<svg
									className="w-5 h-5 mr-2"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
								View on GitHub
							</a>
							<a
								href="#"
								className="text-blue-400 hover:text-blue-300 transition-colors"
							>
								Documentation
							</a>
							<a
								href="#"
								className="text-blue-400 hover:text-blue-300 transition-colors"
							>
								Community Discord
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* Testimonials */}
			<section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<p className="text-blue-400 mb-2">Testimonials</p>
						<h2 className="text-4xl sm:text-5xl font-bold mb-4">
							Loved by Professionals
						</h2>
						<p className="text-gray-400">See what our users have to say</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{testimonials.map((t, i) => (
							<div
								key={i}
								className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-sm"
							>
								<div className="flex text-yellow-400 mb-4">
									{[...Array(5)].map((_, i) => (
										<Star key={i} className="w-5 h-5 fill-yellow-400" />
									))}
								</div>
								<p className="text-gray-300 mb-6">{t.quote}</p>
								<div className="flex items-center">
									<div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center font-bold mr-4">
										{t.initial}
									</div>
									<div>
										<p className="font-semibold">{t.name}</p>
										<p className="text-sm text-gray-400">{t.role}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-4xl sm:text-5xl font-bold mb-6">
						Ready to Build Your Portfolio?
					</h2>
					<p className="text-xl text-gray-400 mb-8">
						Join thousands of developers and creators who've already built their
						stunning portfolio websites. It's completely free and always will
						be.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Link to="/dashboard">
							<button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl shadow-blue-500/50">
								Get Started Free
							</button>
						</Link>
					</div>
					<p className="text-sm text-gray-500 mt-6">
						No account required • Open source • No hidden costs
					</p>
				</div>
			</section>
			<Footer />
		</div>
	);
}
