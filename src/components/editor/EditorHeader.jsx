import React, {useState} from "react";
import {
	ArrowLeft,
	Save,
	Eye,
	Download,
	Settings,
	Play,
	Sparkles,
	Share2,
	MoreVertical,
	Loader2,
	MessageSquare,
	Check,
	GitBranch,
	Keyboard,
	Hammer,
	ExternalLink,
} from "lucide-react";
import AutoSaveIndicator from "./AutoSaveIndicator";
import {useNavigate} from "react-router-dom";
import DeployButton from "./DeployButton";

export default function EditorHeader({
	project,
	onSave,
	onBuild,
	onPreview,
	onDownload,
	onGenerateComponent,
	onOpenChat,
	saving,
	building,
	lastSaved,
	hasUnsavedChanges,
	autoSaveEnabled = true,
	wsConnected = false,
	wsConnecting = false,
	wsError = null,
	wsReconnectCount = 0,
	onReconnect,
	chatOpen,
}) {
	const navigate = useNavigate();
	const [showMenu, setShowMenu] = useState(false);
	const [saveStatus, setSaveStatus] = useState("saved");

	const [showVersionHistory, setShowVersionHistory] = useState(false);
	const [showProjectSettings, setShowProjectSettings] = useState(false);
	const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

	const handleSave = async () => {
		setSaveStatus("saving");
		await onSave();
		setSaveStatus("saved");
		setTimeout(() => setSaveStatus("unsaved"), 2000);
	};

	return (
		<>
			<header className="h-14 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 relative z-50">
				{/* Left Section */}
				<div className="flex items-center gap-4">
					<button
						onClick={() => navigate("/dashboard/projects")}
						className="p-2 hover:bg-white/10 rounded-lg transition-colors"
						title="Back to projects"
					>
						<ArrowLeft className="w-5 h-5 text-gray-400" />
					</button>

					<div className="h-6 w-px bg-white/10" />

					<div>
						<h1 className="text-sm font-semibold text-white">
							{project?.name || "Untitled"}
						</h1>
						<p className="text-xs text-gray-500">
							{saving ? (
								<span className="flex items-center gap-1 text-blue-400">
									<Loader2 className="w-3 h-3 animate-spin" />
									Saving...
								</span>
							) : hasUnsavedChanges ? (
								<span className="text-yellow-400">● Unsaved changes</span>
							) : (
								<span className="flex items-center gap-1 text-green-400">
									<Check className="w-3 h-3" />
									Saved
								</span>
							)}
						</p>
					</div>
				</div>

				{/* Center Section - Primary Actions (visible on larger screens) */}
				<div className="hidden lg:flex items-center gap-2">
					{/* Save Button */}
					<button
						onClick={onSave}
						disabled={saving || !hasUnsavedChanges}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
							${
								hasUnsavedChanges
									? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
									: "bg-white/5 text-gray-500 cursor-not-allowed"
							}`}
						title="Save (Ctrl+S)"
					>
						{saving ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Save className="w-4 h-4" />
						)}
						Save
					</button>

					{/* BUILD BUTTON - PROMINENT */}
					<button
						onClick={onBuild}
						disabled={building}
						className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all
							${
								building
									? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
									: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
							}`}
						title="Build Project (Ctrl+B)"
					>
						{building ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								Building...
							</>
						) : (
							<>
								<Hammer className="w-4 h-4" />
								Build
							</>
						)}
					</button>

					<div className="h-6 w-px bg-white/10 mx-1" />
				</div>

				{/* Right Section */}
				<div className="flex items-center gap-2">
					{/* Mobile/Tablet Build Button */}
					<button
						onClick={onBuild}
						disabled={building}
						className={`lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
							${
								building
									? "bg-orange-500/20 text-orange-400"
									: "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
							}`}
						title="Build Project"
					>
						{building ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Hammer className="w-4 h-4" />
						)}
						<span className="hidden sm:inline">Build</span>
					</button>

					{/* Deploy Button */}
					<DeployButton
						projectId={project?.project_id}
						onDeployComplete={(info) => {
							console.log("Deployed:", info.deploy_url);
						}}
					/>

					{/* AI Chat Button */}
					<button
						onClick={onOpenChat}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
							chatOpen
								? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
								: "bg-white/5 hover:bg-white/10 text-gray-300"
						}`}
						title="AI Chat (Ctrl+/)"
					>
						<MessageSquare className="w-4 h-4" />
						<span className="hidden sm:inline">AI Chat</span>
					</button>

					{/* AI Generate Button */}
					<button
						onClick={onGenerateComponent}
						className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-colors text-sm text-white font-medium"
					>
						<Sparkles className="w-4 h-4" />
						<span className="hidden lg:inline">AI Generate</span>
					</button>

					{/* More Menu */}
					<div className="relative">
						<button
							onClick={() => setShowMenu(!showMenu)}
							className="p-2 hover:bg-white/10 rounded-lg transition-colors"
						>
							<MoreVertical className="w-5 h-5 text-gray-400" />
						</button>

						{showMenu && (
							<>
								{/* Backdrop - higher z-index */}
								<div
									className="fixed inset-0 z-[100]"
									onClick={() => setShowMenu(false)}
								/>
								{/* Dropdown Menu - even higher z-index */}
								<div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-[101] overflow-hidden">
									{/* Show these on mobile/tablet */}
									<div className="lg:hidden border-b border-white/10">
										<button
											onClick={() => {
												onSave();
												setShowMenu(false);
											}}
											disabled={saving || !hasUnsavedChanges}
											className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
										>
											<Save className="w-4 h-4 mr-3" />
											Save Changes
										</button>
										<button
											onClick={() => {
												onPreview();
												setShowMenu(false);
											}}
											className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
										>
											<ExternalLink className="w-4 h-4 mr-3" />
											Preview Site
										</button>
									</div>

									<button
										onClick={() => {
											onDownload();
											setShowMenu(false);
										}}
										className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
									>
										<Download className="w-4 h-4 mr-3" />
										Download Project
									</button>
									<button
										onClick={() => {
											// TODO: Implement share
											setShowMenu(false);
										}}
										className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
									>
										<Share2 className="w-4 h-4 mr-3" />
										Share
									</button>

									<div className="border-t border-white/10" />

									<button
										onClick={() => {
											setShowVersionHistory(true);
											setShowMenu(false);
										}}
										className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
									>
										<GitBranch className="w-4 h-4 mr-3" />
										Version History
									</button>
									<button
										onClick={() => {
											setShowProjectSettings(true);
											setShowMenu(false);
										}}
										className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
									>
										<Settings className="w-4 h-4 mr-3" />
										Project Settings
									</button>
									<button
										onClick={() => {
											setShowKeyboardShortcuts(true);
											setShowMenu(false);
										}}
										className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
									>
										<Keyboard className="w-4 h-4 mr-3" />
										Keyboard Shortcuts
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			</header>

			{/* Modals - Outside header for proper stacking */}
			{showVersionHistory && (
				<div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<div className="bg-slate-800 border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl">
						<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<GitBranch className="w-5 h-5 text-purple-400" />
							Version History
						</h2>
						<p className="text-gray-400 text-sm">
							Version history feature coming soon...
						</p>
						<button
							onClick={() => setShowVersionHistory(false)}
							className="mt-6 w-full px-4 py-2.5 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors font-medium"
						>
							Close
						</button>
					</div>
				</div>
			)}

			{showProjectSettings && (
				<div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<div className="bg-slate-800 border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl">
						<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<Settings className="w-5 h-5 text-blue-400" />
							Project Settings
						</h2>
						<div className="space-y-4">
							<div>
								<label className="block text-sm text-gray-400 mb-1">
									Project Name
								</label>
								<input
									type="text"
									defaultValue={project?.name}
									className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
								/>
							</div>
							<div>
								<label className="block text-sm text-gray-400 mb-1">
									Theme
								</label>
								<select className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500">
									<option value="modern">Modern</option>
									<option value="minimal">Minimal</option>
									<option value="creative">Creative</option>
								</select>
							</div>
						</div>
						<div className="flex gap-3 mt-6">
							<button
								onClick={() => setShowProjectSettings(false)}
								className="flex-1 px-4 py-2.5 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors font-medium"
							>
								Cancel
							</button>
							<button
								onClick={() => setShowProjectSettings(false)}
								className="flex-1 px-4 py-2.5 bg-blue-500 rounded-xl text-white hover:bg-blue-600 transition-colors font-medium"
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{showKeyboardShortcuts && (
				<div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<div className="bg-slate-800 border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl">
						<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<Keyboard className="w-5 h-5 text-green-400" />
							Keyboard Shortcuts
						</h2>
						<div className="space-y-3">
							<div className="flex justify-between items-center text-sm">
								<span className="text-gray-300">Save</span>
								<div className="flex gap-1">
									<kbd className="px-2 py-1 bg-white/10 rounded text-gray-400 text-xs">
										Ctrl
									</kbd>
									<kbd className="px-2 py-1 bg-white/10 rounded text-gray-400 text-xs">
										S
									</kbd>
								</div>
							</div>
							<div className="flex justify-between items-center text-sm">
								<span className="text-gray-300">Build</span>
								<div className="flex gap-1">
									<kbd className="px-2 py-1 bg-white/10 rounded text-gray-400 text-xs">
										Ctrl
									</kbd>
									<kbd className="px-2 py-1 bg-white/10 rounded text-gray-400 text-xs">
										B
									</kbd>
								</div>
							</div>
							<div className="flex justify-between items-center text-sm">
								<span className="text-gray-300">Toggle AI Chat</span>
								<div className="flex gap-1">
									<kbd className="px-2 py-1 bg-white/10 rounded text-gray-400 text-xs">
										Ctrl
									</kbd>
									<kbd className="px-2 py-1 bg-white/10 rounded text-gray-400 text-xs">
										/
									</kbd>
								</div>
							</div>
							<div className="flex justify-between items-center text-sm">
								<span className="text-gray-300">Close Tab</span>
								<div className="flex gap-1">
									<kbd className="px-2 py-1 bg-white/10 rounded text-gray-400 text-xs">
										Ctrl
									</kbd>
									<kbd className="px-2 py-1 bg-white/10 rounded text-gray-400 text-xs">
										W
									</kbd>
								</div>
							</div>
							<div className="flex justify-between items-center text-sm">
								<span className="text-gray-300">Find in File</span>
								<div className="flex gap-1">
									<kbd className="px-2 py-1 bg-white/10 rounded text-gray-400 text-xs">
										Ctrl
									</kbd>
									<kbd className="px-2 py-1 bg-white/10 rounded text-gray-400 text-xs">
										F
									</kbd>
								</div>
							</div>
							<div className="flex justify-between items-center text-sm">
								<span className="text-gray-300">Command Palette</span>
								<div className="flex gap-1">
									<kbd className="px-2 py-1 bg-white/10 rounded text-gray-400 text-xs">
										Ctrl
									</kbd>
									<kbd className="px-2 py-1 bg-white/10 rounded text-gray-400 text-xs">
										Shift
									</kbd>
									<kbd className="px-2 py-1 bg-white/10 rounded text-gray-400 text-xs">
										P
									</kbd>
								</div>
							</div>
						</div>
						<button
							onClick={() => setShowKeyboardShortcuts(false)}
							className="mt-6 w-full px-4 py-2.5 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors font-medium"
						>
							Close
						</button>
					</div>
				</div>
			)}
		</>
	);
}
