import React, {useState, useEffect} from "react";
import {
	Hammer,
	Rocket,
	X,
	Loader2,
	CheckCircle,
	AlertCircle,
	ExternalLink,
	Copy,
	Globe,
	Clock,
	FileCode,
	Package,
	Zap,
} from "lucide-react";
import api from "../../api";

const BUILD_STEPS = [
	{id: "install", label: "Installing dependencies", icon: Package},
	{id: "compile", label: "Compiling code", icon: FileCode},
	{id: "optimize", label: "Optimizing bundle", icon: Zap},
	{id: "deploy", label: "Deploying to server", icon: Rocket},
];

export default function BuildDeployModal({
	isOpen,
	onClose,
	projectId,
	projectName,
}) {
	const [activeTab, setActiveTab] = useState("build"); // 'build' or 'deploy'
	const [isBuilding, setIsBuilding] = useState(false);
	const [buildStatus, setBuildStatus] = useState(null);
	const [buildError, setBuildError] = useState(null);
	const [currentStep, setCurrentStep] = useState(0);
	const [buildProgress, setBuildProgress] = useState(0);
	const [deployUrl, setDeployUrl] = useState(null);
	const [buildLog, setBuildLog] = useState([]);
	const [deployHistory, setDeployHistory] = useState([]);

	useEffect(() => {
		if (isOpen && projectId) {
			loadBuildStatus();
			loadDeployHistory();
		}
	}, [isOpen, projectId]);

	const loadBuildStatus = async () => {
		try {
			const status = await api.getBuildStatus(projectId);
			setBuildStatus(status);
			if (status.deploy_url) {
				setDeployUrl(status.deploy_url);
			}
		} catch (error) {
			console.error("Failed to load build status:", error);
		}
	};

	const loadDeployHistory = async () => {
		try {
			// This would be a real API call
			setDeployHistory([
				{
					id: 1,
					date: new Date().toISOString(),
					status: "success",
					url: "https://myproject.vercel.app",
					duration: "45s",
				},
				{
					id: 2,
					date: new Date(Date.now() - 86400000).toISOString(),
					status: "success",
					url: "https://myproject.vercel.app",
					duration: "38s",
				},
			]);
		} catch (error) {
			console.error("Failed to load deploy history:", error);
		}
	};

	const handleBuild = async () => {
		setIsBuilding(true);
		setBuildError(null);
		setBuildLog([]);
		setCurrentStep(0);
		setBuildProgress(0);

		try {
			// Start build
			await api.buildProject(projectId);

			// Simulate build progress
			for (let i = 0; i < BUILD_STEPS.length; i++) {
				setCurrentStep(i);
				setBuildProgress((i + 1) * 25);

				const step = BUILD_STEPS[i];
				setBuildLog((prev) => [
					...prev,
					{
						time: new Date().toISOString(),
						message: step.label,
						type: "info",
					},
				]);

				// Poll build status
				await new Promise((resolve) => setTimeout(resolve, 2000));

				const status = await api.getBuildStatus(projectId);
				if (status.status === "failed") {
					throw new Error(status.error || "Build failed");
				}
			}

			// Build complete
			setBuildStatus({status: "completed"});
			setDeployUrl(
				`https://${projectName?.toLowerCase().replace(/\s+/g, "-")}.vercel.app`,
			);

			setBuildLog((prev) => [
				...prev,
				{
					time: new Date().toISOString(),
					message: "Build completed successfully!",
					type: "success",
				},
			]);
		} catch (error) {
			setBuildError(error.message);
			setBuildLog((prev) => [
				...prev,
				{
					time: new Date().toISOString(),
					message: error.message,
					type: "error",
				},
			]);
		} finally {
			setIsBuilding(false);
		}
	};

	const handleDeploy = async () => {
		// In a real app, this would trigger deployment
		await handleBuild();
	};

	const copyUrl = () => {
		if (deployUrl) {
			navigator.clipboard.writeText(deployUrl);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
							<Hammer className="w-5 h-5 text-white" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-white">
								Build & Deploy
							</h2>
							<p className="text-sm text-gray-400">{projectName}</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-white/10 rounded-lg transition-colors"
					>
						<X className="w-5 h-5 text-gray-400" />
					</button>
				</div>

				{/* Tabs */}
				<div className="flex items-center gap-2 px-6 py-3 border-b border-white/10">
					<button
						onClick={() => setActiveTab("build")}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
							activeTab === "build"
								? "bg-blue-500/20 text-blue-400"
								: "text-gray-400 hover:text-white hover:bg-white/10"
						}`}
					>
						<Hammer className="w-4 h-4" />
						Build
					</button>
					<button
						onClick={() => setActiveTab("deploy")}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
							activeTab === "deploy"
								? "bg-blue-500/20 text-blue-400"
								: "text-gray-400 hover:text-white hover:bg-white/10"
						}`}
					>
						<Rocket className="w-4 h-4" />
						Deploy
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					{activeTab === "build" && (
						<div className="space-y-6">
							{/* Build Status */}
							{!isBuilding && !buildStatus && (
								<div className="text-center py-12">
									<div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
										<Hammer className="w-10 h-10 text-blue-400" />
									</div>
									<h3 className="text-xl font-semibold text-white mb-2">
										Ready to Build
									</h3>
									<p className="text-gray-400 mb-8">
										Build your project to create an optimized production bundle
									</p>
									<button
										onClick={handleBuild}
										className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold text-white transition-all"
									>
										Start Build
									</button>
								</div>
							)}

							{/* Building Progress */}
							{isBuilding && (
								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<h3 className="font-semibold text-white">
											Building Project...
										</h3>
										<span className="text-sm text-gray-400">
											{buildProgress}%
										</span>
									</div>

									{/* Progress Bar */}
									<div className="h-2 bg-white/10 rounded-full overflow-hidden">
										<div
											className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
											style={{width: `${buildProgress}%`}}
										/>
									</div>

									{/* Build Steps */}
									<div className="space-y-3">
										{BUILD_STEPS.map((step, index) => (
											<div
												key={step.id}
												className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
													index === currentStep
														? "bg-blue-500/20 border border-blue-500/30"
														: index < currentStep
															? "bg-green-500/10 border border-green-500/20"
															: "bg-white/5 border border-white/10 opacity-50"
												}`}
											>
												<div className="flex-shrink-0">
													{index < currentStep ? (
														<CheckCircle className="w-5 h-5 text-green-400" />
													) : index === currentStep ? (
														<Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
													) : (
														<step.icon className="w-5 h-5 text-gray-500" />
													)}
												</div>
												<span
													className={
														index <= currentStep
															? "text-white"
															: "text-gray-500"
													}
												>
													{step.label}
												</span>
											</div>
										))}
									</div>

									{/* Build Log */}
									{buildLog.length > 0 && (
										<div className="bg-black/30 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-xs">
											{buildLog.map((log, index) => (
												<div
													key={index}
													className={`mb-1 ${
														log.type === "error"
															? "text-red-400"
															: log.type === "success"
																? "text-green-400"
																: "text-gray-400"
													}`}
												>
													<span className="text-gray-600">
														{new Date(log.time).toLocaleTimeString()}
													</span>
													{" > "}
													{log.message}
												</div>
											))}
										</div>
									)}
								</div>
							)}

							{/* Build Complete */}
							{!isBuilding && buildStatus?.status === "completed" && (
								<div className="space-y-6">
									<div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
										<div className="flex items-start gap-3">
											<CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
											<div>
												<h3 className="font-semibold text-green-400 mb-2">
													Build Successful!
												</h3>
												<p className="text-sm text-gray-300">
													Your project has been built successfully and is ready
													to deploy.
												</p>
											</div>
										</div>
									</div>

									{deployUrl && (
										<div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
											<label className="text-sm text-gray-400 block mb-2">
												Preview URL
											</label>
											<div className="flex items-center gap-2">
												<input
													type="text"
													value={deployUrl}
													readOnly
													className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm"
												/>
												<button
													onClick={copyUrl}
													className="p-2 hover:bg-white/10 rounded-lg transition-colors"
													title="Copy URL"
												>
													<Copy className="w-5 h-5 text-gray-400" />
												</button>
												<a
													href={deployUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="p-2 hover:bg-white/10 rounded-lg transition-colors"
													title="Open in new tab"
												>
													<ExternalLink className="w-5 h-5 text-gray-400" />
												</a>
											</div>
										</div>
									)}

									<div className="flex items-center gap-3">
										<button
											onClick={handleBuild}
											className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
										>
											Rebuild
										</button>
										<button
											onClick={() => setActiveTab("deploy")}
											className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white transition-colors"
										>
											Deploy Now
										</button>
									</div>
								</div>
							)}

							{/* Build Error */}
							{buildError && (
								<div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
									<div className="flex items-start gap-3">
										<AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
										<div>
											<h3 className="font-semibold text-red-400 mb-2">
												Build Failed
											</h3>
											<p className="text-sm text-gray-300">{buildError}</p>
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					{activeTab === "deploy" && (
						<div className="space-y-6">
							{/* Deploy Info */}
							<div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
								<div className="flex items-start gap-3">
									<Globe className="w-6 h-6 text-purple-400 flex-shrink-0" />
									<div>
										<h3 className="font-semibold text-white mb-2">
											Deploy to Production
										</h3>
										<p className="text-sm text-gray-300 mb-4">
											Deploy your project to a production environment with
											automatic HTTPS, CDN, and more.
										</p>
										<button
											onClick={handleDeploy}
											disabled={isBuilding}
											className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors disabled:opacity-50"
										>
											{isBuilding ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												<Rocket className="w-4 h-4" />
											)}
											Deploy Now
										</button>
									</div>
								</div>
							</div>

							{/* Deploy History */}
							<div>
								<h3 className="font-semibold text-white mb-4">
									Deployment History
								</h3>
								<div className="space-y-3">
									{deployHistory.map((deploy) => (
										<div
											key={deploy.id}
											className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
										>
											<div className="flex items-center gap-3">
												{deploy.status === "success" ? (
													<CheckCircle className="w-5 h-5 text-green-400" />
												) : (
													<AlertCircle className="w-5 h-5 text-red-400" />
												)}
												<div>
													<p className="text-sm text-white font-medium">
														{deploy.url}
													</p>
													<div className="flex items-center gap-3 text-xs text-gray-400">
														<span className="flex items-center gap-1">
															<Clock className="w-3 h-3" />
															{new Date(deploy.date).toLocaleDateString()}
														</span>
														<span>Duration: {deploy.duration}</span>
													</div>
												</div>
											</div>
											<a
												href={deploy.url}
												target="_blank"
												rel="noopener noreferrer"
												className="p-2 hover:bg-white/10 rounded-lg transition-colors"
											>
												<ExternalLink className="w-4 h-4 text-gray-400" />
											</a>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
