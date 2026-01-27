import React from "react";
import {Link} from "react-router-dom";
import {Github, Twitter, Mail} from "lucide-react";

export default function Footer() {
	return (
		<footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-6xl mx-auto">
				<div className="grid md:grid-cols-4 gap-8 mb-12">
					<div className="md:col-span-2">
						<Link to="/" className="flex items-center space-x-2 mb-4">
							<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold">◆</span>
							</div>
							<span className="text-xl font-bold text-white">PortfolioAI</span>
						</Link>
						<p className="text-sm text-white mb-4">
							Transform your resume into a stunning portfolio website in seconds
							with AI-powered generation.
						</p>
						<div className="flex space-x-4">
							<a
								href="https://github.com/faiqfarooq4"
								target="_blank"
								rel="noopener noreferrer"
								className="text-white hover:text-blue-400 transition-colors"
								aria-label="GitHub"
							>
								<Github className="w-5 h-5" />
							</a>
							<a
								href="mailto:faiq@devrolin.com"
								className="text-white hover:text-blue-400 transition-colors"
								aria-label="Email"
							>
								<Mail className="w-5 h-5" />
							</a>
						</div>
					</div>

					<div>
						<h4 className="font-semibold mb-4 text-white">Product</h4>
						<ul className="space-y-2">
							{[
								{name: "Features", href: "/#features"},
								{name: "Themes", href: "/#themes"},
								{name: "Pricing", href: "/#pricing"},
							].map((link, j) => (
								<li key={j}>
									<a
										href={link.href}
										className="text-sm text-white hover:text-blue-400 transition-colors"
									>
										{link.name}
									</a>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="font-semibold mb-4 text-white">Legal</h4>
						<ul className="space-y-2">
							{[
								{name: "About", path: "/about"},
								{name: "Privacy", path: "/privacy"},
								{name: "Terms", path: "/terms"},
								{name: "Contact", path: "/contact"},
							].map((link, j) => (
								<li key={j}>
									<Link
										to={link.path}
										className="text-sm text-white hover:text-blue-400 transition-colors"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-sm text-white">
						© {new Date().getFullYear()} PortfolioAI. All rights reserved.
					</p>
					<p className="text-sm text-white">
						Made with ♥ for professionals worldwide
					</p>
				</div>
			</div>
		</footer>
	);
}
