import React, {useState, useMemo} from "react";
import {
	Eye,
	ExternalLink,
	RefreshCw,
	Loader2,
	AlertCircle,
	Monitor,
	Tablet,
	Smartphone,
	Code,
} from "lucide-react";
import SandpackPreview from "./SandpackPreview";

const DEVICES = [
	{id: "desktop", icon: Monitor, label: "Desktop", width: "100%"},
	{id: "tablet", icon: Tablet, label: "Tablet", width: "768px"},
	{id: "mobile", icon: Smartphone, label: "Mobile", width: "375px"},
];

export default function PreviewPanel({
	projectId,
	files = {},
	activeFile,
	previewMode = "sandpack",
	previewUrl,
	loading,
	error,
	onRefresh,
	template = "react",
}) {
	const [device, setDevice] = useState("desktop");
	const [mode, setMode] = useState("live"); // 'live' (sandpack) or 'build' (iframe)

	const currentDevice = DEVICES.find((d) => d.id === device);
	const hasFiles = files && Object.keys(files).length > 0;

	return (
		<div className="h-full flex flex-col bg-slate-900">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-slate-900/80">
				<div className="flex items-center gap-2">
					<Eye className="w-4 h-4 text-gray-400" />
					<span className="text-sm font-medium text-gray-300">Preview</span>

					{/* Mode Toggle */}
					<div className="ml-3 flex items-center gap-1 px-1 py-1 bg-white/5 rounded-lg">
						<button
							onClick={() => setMode("live")}
							className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
								mode === "live"
									? "bg-blue-500/20 text-blue-400"
									: "text-gray-400 hover:text-white"
							}`}
						>
							<Code className="w-3 h-3" />
							Live
						</button>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{/* Device Selector */}
					<div className="hidden sm:flex items-center gap-1 px-1 py-1 bg-white/5 rounded-lg">
						{DEVICES.map((d) => (
							<button
								key={d.id}
								onClick={() => setDevice(d.id)}
								className={`p-1.5 rounded transition-colors ${
									device === d.id
										? "bg-blue-500/20 text-blue-400"
										: "text-gray-400 hover:text-white"
								}`}
								title={d.label}
							>
								<d.icon className="w-4 h-4" />
							</button>
						))}
					</div>

					<button
						onClick={onRefresh}
						disabled={loading}
						className="p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
						title="Refresh"
					>
						<RefreshCw
							className={`w-4 h-4 text-gray-400 ${loading ? "animate-spin" : ""}`}
						/>
					</button>

					{previewUrl && mode === "build" && (
						<a
							href={previewUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="p-1.5 hover:bg-white/10 rounded transition-colors"
							title="Open in new tab"
						>
							<ExternalLink className="w-4 h-4 text-gray-400" />
						</a>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 relative overflow-hidden bg-slate-950">
				<div
					className="h-full mx-auto transition-all duration-300 overflow-hidden"
					style={{width: currentDevice.width, maxWidth: "100%"}}
				>
					{mode === "live" ? (
						// Sandpack Live Preview
						hasFiles ? (
							<SandpackPreview files={files} loading={loading} error={error} />
						) : (
							<div className="h-full flex items-center justify-center">
								<div className="text-center">
									<Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
									<p className="text-gray-400">Loading files...</p>
								</div>
							</div>
						)
					) : // Build Preview (iframe)
					previewUrl ? (
						<iframe
							key={previewUrl}
							src={previewUrl}
							className="w-full h-full border-0 bg-white"
							title="Build Preview"
							sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
						/>
					) : (
						<div className="h-full flex items-center justify-center">
							<div className="text-center max-w-md p-8">
								<Eye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
								<h3 className="text-xl font-semibold text-white mb-2">
									Build Required
								</h3>
								<p className="text-gray-400 mb-6">
									Click the "Build" button in the header to compile your project
									and see the production preview.
								</p>
								<p className="text-sm text-gray-500">
									Or use the "Live" preview mode to see changes instantly.
								</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Device Label */}
			{device !== "desktop" && (
				<div className="px-4 py-2 bg-slate-900/50 border-t border-white/10 text-center">
					<span className="text-xs text-gray-500">
						{currentDevice.label} ({currentDevice.width})
					</span>
				</div>
			)}
		</div>
	);
}
