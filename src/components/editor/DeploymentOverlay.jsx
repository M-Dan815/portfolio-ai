import React, {useState, useEffect, useRef} from "react";
import {
	Loader2,
	CheckCircle,
	XCircle,
	ExternalLink,
	Rocket,
} from "lucide-react";
import api from "../../api";

const DEPLOYMENT_STEPS = [
	{id: "building", label: "Building project", duration: "~5s"},
	{id: "uploading", label: "Uploading to Vercel", duration: "~10s"},
	{id: "deploying", label: "Deploying", duration: "~30s"},
	{id: "ready", label: "Going live", duration: "~5s"},
];

export default function DeploymentOverlay({
	projectId,
	isVisible,
	onComplete,
	onClose,
	onRetry,
}) {
	const [currentStep, setCurrentStep] = useState(0);
	const [status, setStatus] = useState("deploying"); // deploying, success, error
	const [deployUrl, setDeployUrl] = useState(null);
	const [error, setError] = useState(null);
	const [elapsedTime, setElapsedTime] = useState(0);

	// Track the initial deploy URL when overlay opens - we need a NEW url to consider it success
	const initialDeployUrlRef = useRef(null);
	const deploymentStartTimeRef = useRef(null);
	const hasStartedPollingRef = useRef(false);

	// Reset state when overlay becomes visible
	useEffect(() => {
		if (isVisible) {
			setCurrentStep(0);
			setStatus("deploying");
			setDeployUrl(null);
			setError(null);
			setElapsedTime(0);
			deploymentStartTimeRef.current = Date.now();
			hasStartedPollingRef.current = false;

			// Capture the current deploy URL (if any) so we can detect when it changes
			api
				.getDeploymentStatus(projectId)
				.then((status) => {
					initialDeployUrlRef.current = status.deploy_url || null;
					hasStartedPollingRef.current = true;
				})
				.catch(() => {
					initialDeployUrlRef.current = null;
					hasStartedPollingRef.current = true;
				});
		} else {
			// Clean up when closing
			initialDeployUrlRef.current = null;
			deploymentStartTimeRef.current = null;
			hasStartedPollingRef.current = false;
		}
	}, [isVisible, projectId]);

	// Simulate step progression based on elapsed time
	useEffect(() => {
		if (!isVisible || status !== "deploying") return;

		const stepInterval = setInterval(() => {
			setCurrentStep((prev) => {
				// Progress through steps but cap at the second-to-last step
				// The last step only completes when we get actual success
				if (prev < DEPLOYMENT_STEPS.length - 2) {
					return prev + 1;
				}
				return prev;
			});
		}, 10000); // Progress every 10 seconds

		return () => clearInterval(stepInterval);
	}, [isVisible, status]);

	// Track elapsed time
	useEffect(() => {
		if (!isVisible || status !== "deploying") return;

		const timer = setInterval(() => {
			setElapsedTime((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [isVisible, status]);

	// Poll for actual deployment status
	useEffect(() => {
		if (!isVisible || !projectId || status !== "deploying") return;

		const pollInterval = setInterval(async () => {
			// Wait until we've captured the initial state
			if (!hasStartedPollingRef.current) return;

			try {
				const deployStatus = await api.getDeploymentStatus(projectId);
				console.log("Deployment status poll:", deployStatus);

				// Check for success: must have deploy_url AND it must be different from initial
				// OR if there was no initial URL and now there is one
				const hasNewDeployUrl =
					deployStatus.deploy_url &&
					(!initialDeployUrlRef.current ||
						deployStatus.deploy_url !== initialDeployUrlRef.current);

				// Also check if the project status indicates deployment is complete
				const isDeploymentComplete =
					deployStatus.is_deployed &&
					deployStatus.status === "deployed" &&
					hasNewDeployUrl;

				if (isDeploymentComplete) {
					console.log("Deployment complete! New URL:", deployStatus.deploy_url);
					setStatus("success");
					setDeployUrl(deployStatus.deploy_url);
					setCurrentStep(DEPLOYMENT_STEPS.length);
					clearInterval(pollInterval);
					onComplete?.(deployStatus);
					return;
				}

				// Check for explicit failure status
				if (
					deployStatus.status === "failed" ||
					deployStatus.status === "error"
				) {
					setStatus("error");
					setError(
						deployStatus.error_message ||
							"Deployment failed. Please try again.",
					);
					clearInterval(pollInterval);
					return;
				}

				// Timeout after 2 minutes
				if (elapsedTime > 120) {
					setStatus("error");
					setError("Deployment timed out. Please try again.");
					clearInterval(pollInterval);
					return;
				}
			} catch (err) {
				console.error("Error polling deployment status:", err);
				// Don't fail on polling errors, just keep trying
			}
		}, 3000);

		return () => clearInterval(pollInterval);
	}, [isVisible, projectId, status, elapsedTime, onComplete]);

	const handleRetry = async () => {
		setStatus("deploying");
		setCurrentStep(0);
		setElapsedTime(0);
		setError(null);
		deploymentStartTimeRef.current = Date.now();

		// Capture current state before retrying
		try {
			const currentStatus = await api.getDeploymentStatus(projectId);
			initialDeployUrlRef.current = currentStatus.deploy_url || null;
		} catch {
			initialDeployUrlRef.current = null;
		}

		// Trigger redeploy
		if (onRetry) {
			onRetry();
		} else {
			try {
				await api.redeployProject(projectId);
			} catch (err) {
				setStatus("error");
				setError(err.message || "Failed to start deployment");
			}
		}
	};

	if (!isVisible) return null;

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
	};

	// Calculate progress percentage - cap at 90% until actual success
	const getProgressPercentage = () => {
		if (status === "success") return 100;
		const baseProgress = ((currentStep + 1) / DEPLOYMENT_STEPS.length) * 100;
		return Math.min(baseProgress, 90);
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
			<div className="w-full max-w-md mx-4">
				<div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
					{/* Header */}
					<div className="text-center mb-8">
						{status === "deploying" && (
							<>
								<div
									className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 
                                              flex items-center justify-center border border-purple-500/30"
								>
									<Rocket className="w-8 h-8 text-purple-400 animate-pulse" />
								</div>
								<h2 className="text-xl font-bold text-white mb-1">
									Deploying Your Portfolio
								</h2>
								<p className="text-gray-400 text-sm">
									This usually takes about 30-60 seconds
								</p>
							</>
						)}

						{status === "success" && (
							<>
								<div
									className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/20 
                                              flex items-center justify-center border border-green-500/30"
								>
									<CheckCircle className="w-8 h-8 text-green-400" />
								</div>
								<h2 className="text-xl font-bold text-white mb-1">
									Successfully Deployed! 🎉
								</h2>
								<p className="text-gray-400 text-sm">
									Your portfolio is now live on the internet
								</p>
							</>
						)}

						{status === "error" && (
							<>
								<div
									className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 
                                              flex items-center justify-center border border-red-500/30"
								>
									<XCircle className="w-8 h-8 text-red-400" />
								</div>
								<h2 className="text-xl font-bold text-white mb-1">
									Deployment Failed
								</h2>
								<p className="text-red-400 text-sm">{error}</p>
							</>
						)}
					</div>

					{/* Progress Steps */}
					{status === "deploying" && (
						<div className="space-y-3 mb-6">
							{DEPLOYMENT_STEPS.map((step, index) => (
								<div key={step.id} className="flex items-center gap-3">
									<div
										className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
											index < currentStep
												? "bg-green-500"
												: index === currentStep
													? "bg-purple-500"
													: "bg-white/10"
										}`}
									>
										{index < currentStep ? (
											<CheckCircle className="w-4 h-4 text-white" />
										) : index === currentStep ? (
											<Loader2 className="w-4 h-4 text-white animate-spin" />
										) : (
											<span className="w-2 h-2 rounded-full bg-white/30" />
										)}
									</div>
									<div className="flex-1">
										<p
											className={`text-sm ${
												index <= currentStep ? "text-white" : "text-gray-500"
											}`}
										>
											{step.label}
										</p>
									</div>
									<span className="text-xs text-gray-500">{step.duration}</span>
								</div>
							))}
						</div>
					)}

					{/* Progress Bar */}
					{status === "deploying" && (
						<div className="mb-6">
							<div className="h-2 bg-white/10 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
									style={{
										width: `${getProgressPercentage()}%`,
									}}
								/>
							</div>
							<div className="flex justify-between mt-2 text-xs text-gray-500">
								<span>Elapsed: {formatTime(elapsedTime)}</span>
								<span>{Math.round(getProgressPercentage())}%</span>
							</div>
						</div>
					)}

					{/* Success Actions */}
					{status === "success" && deployUrl && (
						<div className="space-y-3">
							<div className="p-3 bg-white/5 rounded-xl">
								<p className="text-xs text-gray-400 mb-1">Your live URL:</p>
								<a
									href={deployUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-green-400 text-sm font-medium hover:underline break-all"
								>
									{deployUrl}
								</a>
							</div>

							<div className="flex gap-3">
								<button
									onClick={onClose}
									className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 
                                             rounded-xl text-white font-medium transition-colors"
								>
									Close
								</button>
								<a
									href={deployUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                                             bg-gradient-to-r from-green-500 to-emerald-500 
                                             hover:from-green-600 hover:to-emerald-600
                                             rounded-xl text-white font-medium transition-colors"
								>
									<ExternalLink className="w-4 h-4" />
									Visit Site
								</a>
							</div>
						</div>
					)}

					{/* Error Actions */}
					{status === "error" && (
						<div className="flex gap-3">
							<button
								onClick={onClose}
								className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 
                                         rounded-xl text-white font-medium transition-colors"
							>
								Close
							</button>
							<button
								onClick={handleRetry}
								className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 
                                         hover:from-purple-600 hover:to-blue-600
                                         rounded-xl text-white font-medium transition-colors"
							>
								Try Again
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
