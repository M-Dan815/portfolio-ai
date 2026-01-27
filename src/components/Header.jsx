import React, {useState, useEffect, useRef} from "react";
import {
	Menu,
	X,
	User,
	LogOut,
	Settings,
	LayoutDashboard,
	FolderOpen,
} from "lucide-react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const userMenuRef = useRef(null);

	const {isAuthenticated, user, logout} = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const isOnDashboard = location.pathname.startsWith("/dashboard");
	const isOnEditor = location.pathname.startsWith("/editor");

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 50);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
				setUserMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = () => {
		logout();
		setUserMenuOpen(false);
		navigate("/");
	};

	const getInitials = (name) => {
		if (!name) return "U";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	// Don't show header on editor page (it has its own header)
	if (isOnEditor) {
		return null;
	}

	return (
		<nav
			className={`fixed top-0 w-full z-50 transition-all duration-300 ${
				scrolled || isOnDashboard
					? "bg-slate-950/80 backdrop-blur-xl border-b border-white/10"
					: "bg-transparent"
			}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link to="/">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-lg">◆</span>
							</div>
							<span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
								PortfolioAI
							</span>
						</div>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-8">
						{!isAuthenticated ? (
							<>
								<a
									href="/#how"
									className="text-gray-300 hover:text-white transition-colors"
								>
									How It Works
								</a>
								<a
									href="/#themes"
									className="text-gray-300 hover:text-white transition-colors"
								>
									Themes
								</a>
								<a
									href="/#features"
									className="text-gray-300 hover:text-white transition-colors"
								>
									Features
								</a>
								<a
									href="/#pricing"
									className="text-gray-300 hover:text-white transition-colors"
								>
									Pricing
								</a>
								<Link to="/auth">
									<button className="text-gray-300 hover:text-white transition-colors">
										Log In
									</button>
								</Link>
								<Link to="/auth">
									<button className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25">
										Get Started
									</button>
								</Link>
							</>
						) : (
							<>
								<Link
									to="/dashboard"
									className={`flex items-center gap-2 text-gray-300 hover:text-white transition-colors ${
										isOnDashboard ? "text-white" : ""
									}`}
								>
									<LayoutDashboard className="w-4 h-4" />
									Dashboard
								</Link>
								<Link
									to="/dashboard/projects"
									className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
								>
									<FolderOpen className="w-4 h-4" />
									Projects
								</Link>

								{/* User Menu */}
								<div className="relative" ref={userMenuRef}>
									<button
										onClick={() => setUserMenuOpen(!userMenuOpen)}
										className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
									>
										<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
											{getInitials(user?.full_name)}
										</div>
										<span className="text-gray-300 max-w-32 truncate hidden lg:block">
											{user?.full_name || user?.email}
										</span>
									</button>

									{userMenuOpen && (
										<div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
											<div className="px-4 py-3 border-b border-white/10">
												<p className="text-sm font-semibold text-white truncate">
													{user?.full_name || "User"}
												</p>
												<p className="text-xs text-gray-400 truncate">
													{user?.email}
												</p>
											</div>
											<div className="py-2">
												<Link
													to="/dashboard"
													onClick={() => setUserMenuOpen(false)}
													className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
												>
													<LayoutDashboard className="w-4 h-4 mr-3" />
													Dashboard
												</Link>
												<Link
													to="/dashboard/projects"
													onClick={() => setUserMenuOpen(false)}
													className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
												>
													<FolderOpen className="w-4 h-4 mr-3" />
													Projects
												</Link>
												<Link
													to="/dashboard/settings"
													onClick={() => setUserMenuOpen(false)}
													className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
												>
													<Settings className="w-4 h-4 mr-3" />
													Settings
												</Link>
												<div className="border-t border-white/10 my-1" />
												<button
													onClick={handleLogout}
													className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
												>
													<LogOut className="w-4 h-4 mr-3" />
													Log Out
												</button>
											</div>
										</div>
									)}
								</div>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="md:hidden text-white"
					>
						{mobileMenuOpen ? <X /> : <Menu />}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
					<div className="px-4 py-6 space-y-4">
						{!isAuthenticated ? (
							<>
								<a
									href="/#how"
									className="block text-gray-300 hover:text-white"
								>
									How It Works
								</a>
								<a
									href="/#themes"
									className="block text-gray-300 hover:text-white"
								>
									Themes
								</a>
								<a
									href="/#features"
									className="block text-gray-300 hover:text-white"
								>
									Features
								</a>
								<a
									href="/#pricing"
									className="block text-gray-300 hover:text-white"
								>
									Pricing
								</a>
								<Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
									<button className="block w-full text-left text-gray-300 hover:text-white">
										Log In
									</button>
								</Link>
								<Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
									<button className="w-full px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
										Get Started
									</button>
								</Link>
							</>
						) : (
							<>
								<div className="flex items-center space-x-3 pb-4 border-b border-white/10">
									<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
										{getInitials(user?.full_name)}
									</div>
									<div>
										<p className="font-semibold text-white">
											{user?.full_name || "User"}
										</p>
										<p className="text-sm text-gray-400">{user?.email}</p>
									</div>
								</div>
								<Link
									to="/dashboard"
									onClick={() => setMobileMenuOpen(false)}
									className="flex items-center text-gray-300 hover:text-white"
								>
									<LayoutDashboard className="w-4 h-4 mr-3" />
									Dashboard
								</Link>
								<Link
									to="/dashboard/projects"
									onClick={() => setMobileMenuOpen(false)}
									className="flex items-center text-gray-300 hover:text-white"
								>
									<FolderOpen className="w-4 h-4 mr-3" />
									Projects
								</Link>
								<Link
									to="/dashboard/settings"
									onClick={() => setMobileMenuOpen(false)}
									className="flex items-center text-gray-300 hover:text-white"
								>
									<Settings className="w-4 h-4 mr-3" />
									Settings
								</Link>
								<button
									onClick={() => {
										handleLogout();
										setMobileMenuOpen(false);
									}}
									className="flex items-center text-red-400 hover:text-red-300"
								>
									<LogOut className="w-4 h-4 mr-3" />
									Log Out
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</nav>
	);
}
