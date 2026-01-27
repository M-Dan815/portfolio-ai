import React, {useState} from "react";
import {
	Wifi,
	WifiOff,
	Loader2,
	AlertCircle,
	X,
	RefreshCw,
	CheckCircle,
} from "lucide-react";

export default function ConnectionStatus({
	isConnected,
	isConnecting,
	connectionError,
	reconnectCount,
	onReconnect,
}) {
	const [showDetails, setShowDetails] = useState(false);

	const getStatusInfo = () => {
		if (isConnected) {
			return {
				icon: Wifi,
				color: "text-green-400",
				bg: "bg-green-500/20",
				border: "border-green-500/30",
				label: "Connected",
				description: "Real-time sync active",
			};
		} else if (isConnecting) {
			return {
				icon: Loader2,
				color: "text-blue-400",
				bg: "bg-blue-500/20",
				border: "border-blue-500/30",
				label: "Connecting...",
				description:
					reconnectCount > 0
						? `Attempt ${reconnectCount}`
						: "Establishing connection",
				animate: true,
			};
		} else if (connectionError) {
			return {
				icon: WifiOff,
				color: "text-red-400",
				bg: "bg-red-500/20",
				border: "border-red-500/30",
				label: "Disconnected",
				description: connectionError,
			};
		} else {
			return {
				icon: WifiOff,
				color: "text-yellow-400",
				bg: "bg-yellow-500/20",
				border: "border-yellow-500/30",
				label: "Offline",
				description: "Working in offline mode",
			};
		}
	};

	const status = getStatusInfo();
	const StatusIcon = status.icon;

	return (
		<div className="relative">
			{/* Status Indicator */}
			<button
				onClick={() => setShowDetails(!showDetails)}
				className={`flex items-center gap-2 px-3 py-1.5 ${status.bg} border ${status.border} rounded-lg transition-all hover:scale-105`}
			>
				<StatusIcon
					className={`w-4 h-4 ${status.color} ${status.animate ? "animate-spin" : ""}`}
				/>
				<span
					className={`text-xs font-medium ${status.color} hidden sm:inline`}
				>
					{status.label}
				</span>
			</button>

			{/* Details Popup */}
			{showDetails && (
				<>
					<div
						className="fixed inset-0 z-10"
						onClick={() => setShowDetails(false)}
					/>
					<div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
						{/* Header */}
						<div
							className={`flex items-center justify-between px-4 py-3 ${status.bg} border-b border-white/10`}
						>
							<div className="flex items-center gap-2">
								<StatusIcon className={`w-5 h-5 ${status.color}`} />
								<span className={`font-semibold ${status.color}`}>
									{status.label}
								</span>
							</div>
							<button
								onClick={() => setShowDetails(false)}
								className="p-1 hover:bg-white/10 rounded transition-colors"
							>
								<X className="w-4 h-4 text-gray-400" />
							</button>
						</div>

						{/* Content */}
						<div className="p-4 space-y-3">
							<div>
								<p className="text-sm text-gray-300 mb-2">
									{status.description}
								</p>
							</div>

							{/* Connection Details */}
							<div className="space-y-2 text-xs">
								<div className="flex items-center justify-between py-2 border-b border-white/10">
									<span className="text-gray-400">Status</span>
									<span className={status.color}>{status.label}</span>
								</div>

								{reconnectCount > 0 && (
									<div className="flex items-center justify-between py-2 border-b border-white/10">
										<span className="text-gray-400">Reconnect Attempts</span>
										<span className="text-white">{reconnectCount}</span>
									</div>
								)}

								{isConnected && (
									<div className="flex items-center justify-between py-2">
										<span className="text-gray-400">Auto-save</span>
										<span className="flex items-center gap-1 text-green-400">
											<CheckCircle className="w-3 h-3" />
											Enabled
										</span>
									</div>
								)}
							</div>

							{/* Actions */}
							{!isConnected && !isConnecting && (
								<button
									onClick={() => {
										onReconnect();
										setShowDetails(false);
									}}
									className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
								>
									<RefreshCw className="w-4 h-4" />
									Reconnect
								</button>
							)}

							{connectionError && (
								<div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
									<div className="flex items-start gap-2">
										<AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
										<p className="text-xs text-red-400">{connectionError}</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
