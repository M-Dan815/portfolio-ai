import React, {useState, useEffect, useRef} from "react";
import {
	Rocket,
	Loader2,
	ExternalLink,
	RefreshCw,
	Globe,
	Copy,
	CheckCheck,
	ChevronDown,
} from "lucide-react";
import api from "../../api";
import {useToast} from "../ui/Toast";

export default function DeployButton({projectId, onDeployComplete}) {
	const {addToast, updateToast} = useToast();

	const [deploying, setDeploying] = useState(false);
	const [deploymentInfo, setDeploymentInfo] = useState(null);
	const [copied, setCopied] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const [deployToastId, setDeployToastId] = useState(null);

	// Track state at deployment start to detect changes
	const deploymentStartRef = useRef(null);
	const initialDeployUrlRef = useRef(null);
	const initialDeployedAtRef = useRef(null);

	// Fetch deployment status on mount
	useEffect(() => {
		fetchDeploymentStatus(false);
	}, [projectId]);

	// Poll while deploying
	useEffect(() => {
		let interval;
		if (deploying) {
			interval = setInterval(() => fetchDeploymentStatus(true), 3000);
		}
		return () => clearInterval(interval);
	}, [deploying]);

	const fetchDeploymentStatus = async (isPolling = false) => {
		try {
			const status = await api.getDeploymentStatus(projectId);
			setDeploymentInfo(status);

			// Only check for completion/failure when actively deploying and polling
			if (isPolling && deploying && deploymentStartRef.current) {
				const isNewDeployment = detectNewDeployment(status);

				if (isNewDeployment) {
					handleDeploymentComplete(status);
					return;
				}

				// Check for timeout (2 minutes)
				const elapsed = Date.now() - deploymentStartRef.current;
				if (elapsed > 120000) {
					handleDeploymentFailed("Deployment timed out. Please try again.");
					return;
				}

				// Check for explicit failure status
				if (status.status === "failed" || status.status === "error") {
					handleDeploymentFailed(
						status.error_message || "Deployment failed. Please try again.",
					);
					return;
				}
			}
		} catch (err) {
			console.error("Failed to fetch deployment status:", err);
		}
	};

	const detectNewDeployment = (status) => {
		// A deployment is considered complete if:
		// 1. is_deployed is true AND status is "deployed"
		// 2. AND one of:
		//    a. deploy_url changed from initial
		//    b. last_deployed_at changed from initial
		//    c. We didn't have a deploy_url before and now we do

		if (!status.is_deployed || status.status !== "deployed") {
			return false;
		}

		if (!status.deploy_url) {
			return false;
		}

		// Check if deploy_url changed
		if (initialDeployUrlRef.current !== status.deploy_url) {
			console.log("Deployment complete: URL changed", {
				initial: initialDeployUrlRef.current,
				new: status.deploy_url,
			});
			return true;
		}

		// Check if last_deployed_at changed
		if (
			status.last_deployed_at &&
			initialDeployedAtRef.current !== status.last_deployed_at
		) {
			console.log("Deployment complete: Timestamp changed", {
				initial: initialDeployedAtRef.current,
				new: status.last_deployed_at,
			});
			return true;
		}

		// Check if this is a first-time deployment (no initial URL but now has one)
		if (!initialDeployUrlRef.current && status.deploy_url) {
			console.log("Deployment complete: First deployment");
			return true;
		}

		return false;
	};

	const handleDeploymentComplete = (status) => {
		setDeploying(false);
		deploymentStartRef.current = null;

		// Update the loading toast to success
		if (deployToastId) {
			updateToast(deployToastId, {
				type: "success",
				title: "Deployment Successful! 🎉",
				message: "Your portfolio is now live.",
				action: status.deploy_url
					? {
							label: "Open Site →",
							onClick: () => window.open(status.deploy_url, "_blank"),
						}
					: undefined,
				duration: 8000,
			});
			setDeployToastId(null);
		}

		onDeployComplete?.(status);
	};

	const handleDeploymentFailed = (error) => {
		setDeploying(false);
		deploymentStartRef.current = null;

		// Update the loading toast to error
		if (deployToastId) {
			updateToast(deployToastId, {
				type: "error",
				title: "Deployment Failed",
				message: error || "Something went wrong. Please try again.",
				duration: 8000,
			});
			setDeployToastId(null);
		}
	};

	const captureInitialState = async () => {
		try {
			const status = await api.getDeploymentStatus(projectId);
			initialDeployUrlRef.current = status.deploy_url || null;
			initialDeployedAtRef.current = status.last_deployed_at || null;
			console.log("Captured initial deployment state:", {
				url: initialDeployUrlRef.current,
				deployedAt: initialDeployedAtRef.current,
			});
		} catch {
			initialDeployUrlRef.current = null;
			initialDeployedAtRef.current = null;
		}
	};

	const handleDeploy = async () => {
		// Capture current state BEFORE starting deployment
		await captureInitialState();

		setDeploying(true);
		setShowDropdown(false);
		deploymentStartRef.current = Date.now();

		// Show loading toast
		const toastId = addToast({
			type: "loading",
			title: "Deploying to Vercel...",
			message: "Building and uploading your portfolio",
		});
		setDeployToastId(toastId);

		try {
			await api.deployProject(projectId, {
				provider: "vercel",
				production: true,
			});
			// Continue polling - success will be detected in fetchDeploymentStatus
		} catch (err) {
			handleDeploymentFailed(err.message);
		}
	};

	const handleRedeploy = async () => {
		// Capture current state BEFORE starting deployment
		await captureInitialState();

		setDeploying(true);
		setShowDropdown(false);
		deploymentStartRef.current = Date.now();

		// Show loading toast
		const toastId = addToast({
			type: "loading",
			title: "Redeploying...",
			message: "Updating your live portfolio with latest changes",
		});
		setDeployToastId(toastId);

		try {
			await api.redeployProject(projectId);
			// Continue polling
		} catch (err) {
			handleDeploymentFailed(err.message);
		}
	};

	const copyUrl = async () => {
		if (deploymentInfo?.deploy_url) {
			await navigator.clipboard.writeText(deploymentInfo.deploy_url);
			setCopied(true);

			addToast({
				type: "success",
				title: "URL Copied!",
				message: deploymentInfo.deploy_url,
				duration: 3000,
			});

			setTimeout(() => setCopied(false), 2000);
		}
	};

	const isDeployed = deploymentInfo?.is_deployed && deploymentInfo?.deploy_url;

	return (
		<div className="relative">
			{/* Main Button */}
			{deploying ? (
				// Deploying state - prominent loading indicator
				<button
					disabled
					className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 
                             border border-purple-500/30 rounded-lg text-purple-300 cursor-wait"
				>
					<Loader2 className="w-4 h-4 animate-spin" />
					<span className="hidden sm:inline">Deploying...</span>
				</button>
			) : isDeployed ? (
				// Deployed state
				<div className="flex items-center">
					<a
						href={deploymentInfo.deploy_url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 
                                 rounded-l-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
					>
						<Globe className="w-4 h-4" />
						<span className="text-sm font-medium hidden sm:inline">Live</span>
					</a>

					<button
						onClick={() => setShowDropdown(!showDropdown)}
						className="flex items-center gap-1 px-2 py-2 bg-green-500/20 text-green-400 
                                 rounded-r-lg border border-l-0 border-green-500/30 
                                 hover:bg-green-500/30 transition-colors"
					>
						<ChevronDown
							className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
						/>
					</button>
				</div>
			) : (
				// Not deployed state
				<button
					onClick={handleDeploy}
					className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 
                             hover:from-purple-600 hover:to-blue-600 rounded-lg font-medium text-white 
                             transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
				>
					<Rocket className="w-4 h-4" />
					<span className="hidden sm:inline">Deploy</span>
				</button>
			)}

			{/* Dropdown Menu */}
			{showDropdown && isDeployed && (
				<>
					<div
						className="fixed inset-0 z-40"
						onClick={() => setShowDropdown(false)}
					/>
					<div
						className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-white/10 
                                  rounded-xl shadow-2xl z-50 overflow-hidden"
					>
						{/* URL Display */}
						<div className="p-3 border-b border-white/10">
							<p className="text-xs text-gray-400 mb-1">Live URL</p>
							<div className="flex items-center gap-2">
								<code className="flex-1 text-xs text-green-400 truncate bg-black/20 px-2 py-1 rounded">
									{deploymentInfo.deploy_url}
								</code>
								<button
									onClick={copyUrl}
									className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
									title="Copy URL"
								>
									{copied ? (
										<CheckCheck className="w-4 h-4 text-green-400" />
									) : (
										<Copy className="w-4 h-4 text-gray-400" />
									)}
								</button>
							</div>
						</div>

						{/* Actions */}
						<div className="p-2">
							<a
								href={deploymentInfo.deploy_url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-300 
                                         hover:bg-white/10 rounded-lg transition-colors"
							>
								<ExternalLink className="w-4 h-4" />
								Open Live Site
							</a>

							<button
								onClick={handleRedeploy}
								className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-300 
                                         hover:bg-white/10 rounded-lg transition-colors"
							>
								<RefreshCw className="w-4 h-4" />
								Redeploy with Changes
							</button>
						</div>

						{/* Last deployed */}
						{deploymentInfo.last_deployed_at && (
							<div className="px-3 py-2 bg-white/5 border-t border-white/10">
								<p className="text-xs text-gray-500">
									Last deployed:{" "}
									{new Date(deploymentInfo.last_deployed_at).toLocaleString()}
								</p>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
