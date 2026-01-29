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
} from "lucide-react";
import ConnectionStatus from "./ConnectionStatus";
import AutoSaveIndicator from "./AutoSaveIndicator";
import {useNavigate} from "react-router-dom";

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
	const [saveStatus, setSaveStatus] = useState("saved"); // 'saving', 'saved', 'unsaved'

	const handleSave = async () => {
		setSaveStatus("saving");
		await onSave();
		setSaveStatus("saved");
		setTimeout(() => setSaveStatus("unsaved"), 2000);
	};

	return (
		<header className="h-14 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4">
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
						{saveStatus === "saving" && "Saving..."}
						{saveStatus === "saved" && (
							<span className="flex items-center gap-1">
								<Check className="w-3 h-3" />
								Saved
							</span>
						)}
						{saveStatus === "unsaved" && "Unsaved changes"}
					</p>
				</div>
			</div>

			{/* Center Section - Actions */}
			<div className="flex items-center gap-3">
				<AutoSaveIndicator
					isSaving={saving}
					lastSaved={lastSaved}
					hasUnsavedChanges={hasUnsavedChanges}
					autoSaveEnabled={autoSaveEnabled}
				/>

				<div className="w-px h-4 bg-white/10" />

				<ConnectionStatus
					isConnected={wsConnected}
					isConnecting={wsConnecting}
					connectionError={wsError}
					reconnectCount={wsReconnectCount}
					onReconnect={onReconnect}
				/>
			</div>

			{/* Right Section */}
			<div className="flex items-center gap-2">
				<button
					onClick={onOpenChat}
					className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
						chatOpen
							? "bg-purple-500/20 text-purple-400"
							: "bg-white/5 hover:bg-white/10 text-gray-300"
					}`}
					title="AI Chat (Ctrl+/)"
				>
					<MessageSquare className="w-4 h-4" />
					<span className="hidden sm:inline">AI Chat</span>
				</button>{" "}
				<button
					onClick={onGenerateComponent}
					className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-colors text-sm text-white"
				>
					<Sparkles className="w-4 h-4" />
					AI Generate
				</button>
				<div className="relative">
					<button
						onClick={() => setShowMenu(!showMenu)}
						className="p-2 hover:bg-white/10 rounded-lg transition-colors"
					>
						<MoreVertical className="w-5 h-5 text-gray-400" />
					</button>

					{showMenu && (
						<>
							<div
								className="fixed inset-0 z-10"
								onClick={() => setShowMenu(false)}
							/>
							<div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
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
										navigate(`/dashboard/settings`);
										setShowMenu(false);
									}}
									className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
								>
									<Settings className="w-4 h-4 mr-3" />
									Project Settings
								</button>
								// In the EditorHeader's more menu, add:
								<button
									onClick={() => setShowBuildModal(true)}
									className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
								>
									<Hammer className="w-4 h-4 mr-3" />
									Build & Deploy
								</button>
								<button
									onClick={() => setShowVersionHistory(true)}
									className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
								>
									<GitBranch className="w-4 h-4 mr-3" />
									Version History
								</button>
								<button
									onClick={() => setShowProjectSettings(true)}
									className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
								>
									<Settings className="w-4 h-4 mr-3" />
									Project Settings
								</button>
								<button
									onClick={() => setShowKeyboardShortcuts(true)}
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
	);
}
