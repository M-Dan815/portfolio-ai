import React, {useState} from "react";
import {
	Search,
	Command,
	File,
	Code,
	Settings,
	GitBranch,
	Hammer,
	Download,
	Share2,
	HelpCircle,
} from "lucide-react";

export default function QuickActionsBar({
	onSearch,
	onCommand,
	onNewFile,
	onSettings,
	onVersionHistory,
	onBuild,
	onDownload,
	onShare,
	onHelp,
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [showCommandPalette, setShowCommandPalette] = useState(false);

	const actions = [
		{icon: File, label: "New File", shortcut: "Ctrl+N", onClick: onNewFile},
		{icon: GitBranch, label: "Version History", onClick: onVersionHistory},
		{icon: Hammer, label: "Build", shortcut: "Ctrl+B", onClick: onBuild},
		{icon: Download, label: "Download", onClick: onDownload},
		{icon: Share2, label: "Share", onClick: onShare},
		{
			icon: Settings,
			label: "Settings",
			shortcut: "Ctrl+,",
			onClick: onSettings,
		},
		{icon: HelpCircle, label: "Help", shortcut: "?", onClick: onHelp},
	];

	return (
		<div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border-b border-white/10">
			{/* Search */}
			<div className="relative flex-1 max-w-md">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && searchQuery) {
							onSearch(searchQuery);
						}
					}}
					placeholder="Search files..."
					className="w-full pl-10 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
				/>
			</div>

			{/* Command Palette */}
			<button
				onClick={() => setShowCommandPalette(true)}
				className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors"
			>
				<Command className="w-4 h-4" />
				<span className="hidden md:inline">Commands</span>
				<kbd className="hidden md:inline px-1.5 py-0.5 bg-white/10 rounded text-xs">
					⌘K
				</kbd>
			</button>

			<div className="w-px h-4 bg-white/10" />

			{/* Quick Actions */}
			<div className="flex items-center gap-1">
				{actions.map((action, index) => (
					<button
						key={index}
						onClick={action.onClick}
						className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
						title={`${action.label}${action.shortcut ? ` (${action.shortcut})` : ""}`}
					>
						<action.icon className="w-4 h-4 text-gray-400" />
					</button>
				))}
			</div>
		</div>
	);
}
