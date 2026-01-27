import React, {useState, useEffect} from "react";
import {
	Mail,
	Lock,
	User,
	Eye,
	EyeOff,
	ArrowRight,
	Github,
	Loader2,
	AlertCircle,
} from "lucide-react";
import {useNavigate, useLocation} from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {useAuth} from "../context/AuthContext";

export default function AuthPage() {
	const [currentPage, setCurrentPage] = useState("login");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const {
		login,
		signup,
		isAuthenticated,
		error: authError,
		clearError,
	} = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const from = location.state?.from?.pathname || "/dashboard";

	useEffect(() => {
		if (isAuthenticated) {
			navigate(from, {replace: true});
		}
	}, [isAuthenticated, navigate, from]);

	useEffect(() => {
		if (authError) {
			setError(authError);
			clearError();
		}
	}, [authError, clearError]);

	const handleInputChange = (e) => {
		const {name, value} = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		setError(null);
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const result = await login(formData.email, formData.password);

		if (!result.success) {
			setError(result.error);
		}

		setLoading(false);
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		setError(null);

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match!");
			return;
		}

		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setLoading(true);
		const result = await signup(
			formData.email,
			formData.password,
			formData.name,
		);

		if (!result.success) {
			setError(result.error);
		}

		setLoading(false);
	};

	const switchPage = (page) => {
		setCurrentPage(page);
		setError(null);
		setFormData({
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		});
	};

	const isLogin = currentPage === "login";

	return (
		<div>
			<Header />
			<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-12">
				<div className="w-full max-w-md">
					{/* Logo */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center space-x-2 mb-4">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
								<span className="text-white font-bold text-2xl">◆</span>
							</div>
							<span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
								PortfolioAI
							</span>
						</div>
						<h1 className="text-3xl font-bold text-white mb-2">
							{isLogin ? "Welcome Back" : "Create Account"}
						</h1>
						<p className="text-gray-400">
							{isLogin
								? "Sign in to continue to your portfolio"
								: "Start building your portfolio today"}
						</p>
					</div>

					{/* Form Card */}
					<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-sm">
						<form
							onSubmit={isLogin ? handleLogin : handleRegister}
							className="space-y-6"
						>
							{/* Error Alert */}
							{error && (
								<div className="flex items-center p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
									<AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
									<p className="text-sm text-red-400">{error}</p>
								</div>
							)}

							{/* Name Input - Only for Register */}
							{!isLogin && (
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Full Name
									</label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
										<input
											type="text"
											name="name"
											value={formData.name}
											onChange={handleInputChange}
											placeholder="John Doe"
											className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
										/>
									</div>
								</div>
							)}

							{/* Email Input */}
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Email Address
								</label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleInputChange}
										placeholder="you@example.com"
										required
										className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
									/>
								</div>
							</div>

							{/* Password Input */}
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Password
								</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
									<input
										type={showPassword ? "text" : "password"}
										name="password"
										value={formData.password}
										onChange={handleInputChange}
										placeholder={
											isLogin
												? "Enter your password"
												: "Create a strong password"
										}
										required
										className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
									>
										{showPassword ? (
											<EyeOff className="w-5 h-5" />
										) : (
											<Eye className="w-5 h-5" />
										)}
									</button>
								</div>
							</div>

							{/* Confirm Password Input - Only for Register */}
							{!isLogin && (
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Confirm Password
									</label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
										<input
											type={showPassword ? "text" : "password"}
											name="confirmPassword"
											value={formData.confirmPassword}
											onChange={handleInputChange}
											placeholder="Confirm your password"
											required
											className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
										/>
									</div>
								</div>
							)}

							{/* Login-specific: Remember Me & Forgot Password */}
							{isLogin && (
								<div className="flex items-center justify-between">
									<label className="flex items-center cursor-pointer">
										<input
											type="checkbox"
											className="w-4 h-4 rounded border-gray-600 bg-slate-900/50 text-blue-600"
										/>
										<span className="ml-2 text-sm text-gray-300">
											Remember me
										</span>
									</label>
									<button
										type="button"
										className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
									>
										Forgot password?
									</button>
								</div>
							)}

							{/* Register-specific: Terms & Conditions */}
							{!isLogin && (
								<div>
									<label className="flex items-start cursor-pointer">
										<input
											type="checkbox"
											required
											className="w-4 h-4 mt-1 rounded border-gray-600 bg-slate-900/50 text-blue-600"
										/>
										<span className="ml-2 text-sm text-gray-300">
											I agree to the{" "}
											<button
												type="button"
												className="text-blue-400 hover:text-blue-300"
											>
												Terms of Service
											</button>{" "}
											and{" "}
											<button
												type="button"
												className="text-blue-400 hover:text-blue-300"
											>
												Privacy Policy
											</button>
										</span>
									</label>
								</div>
							)}

							{/* Submit Button */}
							<button
								type="submit"
								disabled={loading}
								className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? (
									<Loader2 className="w-5 h-5 animate-spin" />
								) : (
									<>
										{isLogin ? "Sign In" : "Create Account"}
										<ArrowRight className="w-5 h-5 ml-2" />
									</>
								)}
							</button>
						</form>

						{/* Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-600"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-transparent text-gray-400">
									{isLogin ? "Or continue with" : "Or sign up with"}
								</span>
							</div>
						</div>

						{/* Social Login */}
						<div className="grid grid-cols-2 gap-4">
							<button
								type="button"
								className="flex items-center justify-center px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all"
							>
								<Github className="w-5 h-5 mr-2" />
								GitHub
							</button>
							<button
								type="button"
								className="flex items-center justify-center px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all"
							>
								<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
									<path
										fill="currentColor"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="currentColor"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="currentColor"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="currentColor"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
								Google
							</button>
						</div>

						{/* Switch Page Link */}
						<div className="mt-6 text-center">
							<p className="text-gray-400">
								{isLogin
									? "Don't have an account? "
									: "Already have an account? "}
								<button
									type="button"
									onClick={() => switchPage(isLogin ? "register" : "login")}
									className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
								>
									{isLogin ? "Sign up" : "Sign in"}
								</button>
							</p>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
}
