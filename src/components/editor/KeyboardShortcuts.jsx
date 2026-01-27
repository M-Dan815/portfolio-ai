import React from "react";
import {Keyboard, X} from "lucide-react";

const SHORTCUTS = [
	{
		category: "File Operations",
		shortcuts: [
			{keys: ["Ctrl", "S"], mac: ["⌘", "S"], action: "Save file"},
			{
				keys: ["Ctrl", "Shift", "S"],
				mac: ["⌘", "Shift", "S"],
				action: "Save all files",
			},
			{keys: ["Ctrl", "W"], mac: ["⌘", "W"], action: "Close file"},
			{keys: ["Ctrl", "N"], mac: ["⌘", "N"], action: "New file"},
		],
	},
	{
		category: "Editor",
		shortcuts: [
			{keys: ["Ctrl", "F"], mac: ["⌘", "F"], action: "Find"},
			{keys: ["Ctrl", "H"], mac: ["⌘", "H"], action: "Find and replace"},
			{keys: ["Ctrl", "D"], mac: ["⌘", "D"], action: "Select next occurrence"},
			{keys: ["Ctrl", "/"], mac: ["⌘", "/"], action: "Toggle comment"},
			{keys: ["Alt", "Up"], mac: ["⌥", "↑"], action: "Move line up"},
			{keys: ["Alt", "Down"], mac: ["⌥", "↓"], action: "Move line down"},
			{
				keys: ["Shift", "Alt", "F"],
				mac: ["Shift", "⌥", "F"],
				action: "Format document",
			},
		],
	},
	{
		category: "Build & Preview",
		shortcuts: [
			{keys: ["Ctrl", "B"], mac: ["⌘", "B"], action: "Build project"},
			{
				keys: ["Ctrl", "Shift", "P"],
				mac: ["⌘", "Shift", "P"],
				action: "Open preview",
			},
			{keys: ["F5"], mac: ["F5"], action: "Refresh preview"},
		],
	},
	{
		category: "Navigation",
		shortcuts: [
			{keys: ["Ctrl", "P"], mac: ["⌘", "P"], action: "Quick open file"},
			{
				keys: ["Ctrl", "Shift", "E"],
				mac: ["⌘", "Shift", "E"],
				action: "Toggle file explorer",
			},
			{keys: ["Ctrl", "`"], mac: ["⌘", "`"], action: "Toggle terminal"},
			{keys: ["Ctrl", "Tab"], mac: ["⌘", "Tab"], action: "Switch tabs"},
		],
	},
];

export default function KeyboardShortcuts({isOpen, onClose}) {
	if (!isOpen) return null;

	const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Panel */}
			<div className="relative w-full max-w-3xl max-h-[80vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
					<div className="flex items-center gap-3">
						<Keyboard className="w-6 h-6 text-blue-400" />
						<h2 className="text-xl font-semibold text-white">
							Keyboard Shortcuts
						</h2>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-white/10 rounded-lg transition-colors"
					>
						<X className="w-5 h-5 text-gray-400" />
					</button>
				</div>

				{/* Content */}
				<div className="overflow-y-auto p-6">
					<div className="space-y-8">
						{SHORTCUTS.map((category) => (
							<div key={category.category}>
								<h3 className="text-lg font-semibold text-white mb-4">
									{category.category}
								</h3>
								<div className="space-y-2">
									{category.shortcuts.map((shortcut, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
										>
											<span className="text-gray-300">{shortcut.action}</span>
											<div className="flex items-center gap-1">
												{(isMac ? shortcut.mac : shortcut.keys).map(
													(key, i) => (
														<React.Fragment key={i}>
															{i > 0 && (
																<span className="text-gray-500 mx-1">+</span>
															)}
															<kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white font-mono">
																{key}
															</kbd>
														</React.Fragment>
													),
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-white/10 bg-slate-900/50">
					<p className="text-xs text-gray-500 text-center">
						Press{" "}
						<kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">?</kbd>{" "}
						anytime to show this help
					</p>
				</div>
			</div>
		</div>
	);
}
