import React, {useState} from "react";
import {AlertTriangle, ArrowRight, X} from "lucide-react";
import MonacoEditor from "./MonacoEditor";

export default function ConflictResolutionModal({
	isOpen,
	onClose,
	filePath,
	localContent,
	remoteContent,
	onResolve,
}) {
	const [selectedVersion, setSelectedVersion] = useState("local");
	const [previewContent, setPreviewContent] = useState(localContent);

	const handleResolve = () => {
		const contentToUse =
			selectedVersion === "local" ? localContent : remoteContent;
		onResolve(contentToUse);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-6xl h-[80vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-yellow-500/10">
					<div className="flex items-center gap-3">
						<AlertTriangle className="w-6 h-6 text-yellow-400" />
						<div>
							<h2 className="text-xl font-semibold text-white">
								Merge Conflict
							</h2>
							<p className="text-sm text-gray-400">
								{filePath} has been modified by another user
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-white/10 rounded-lg transition-colors"
					>
						<X className="w-5 h-5 text-gray-400" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-hidden">
					<div className="grid grid-cols-2 h-full">
						{/* Local Version */}
						<div className="flex flex-col border-r border-white/10">
							<div className="px-4 py-3 bg-slate-800/50 border-b border-white/10">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold text-white">Your Changes</h3>
									<button
										onClick={() => {
											setSelectedVersion("local");
											setPreviewContent(localContent);
										}}
										className={`px-3 py-1 text-xs rounded-lg transition-colors ${
											selectedVersion === "local"
												? "bg-blue-500 text-white"
												: "bg-white/10 text-gray-400 hover:bg-white/20"
										}`}
									>
										Use This
									</button>
								</div>
							</div>
							<div className="flex-1 overflow-hidden">
								<MonacoEditor
									value={localContent}
									filePath={filePath}
									readOnly={true}
								/>
							</div>
						</div>

						{/* Remote Version */}
						<div className="flex flex-col">
							<div className="px-4 py-3 bg-slate-800/50 border-b border-white/10">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold text-white">Server Version</h3>
									<button
										onClick={() => {
											setSelectedVersion("remote");
											setPreviewContent(remoteContent);
										}}
										className={`px-3 py-1 text-xs rounded-lg transition-colors ${
											selectedVersion === "remote"
												? "bg-blue-500 text-white"
												: "bg-white/10 text-gray-400 hover:bg-white/20"
										}`}
									>
										Use This
									</button>
								</div>
							</div>
							<div className="flex-1 overflow-hidden">
								<MonacoEditor
									value={remoteContent}
									filePath={filePath}
									readOnly={true}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between">
					<p className="text-sm text-gray-400">
						Select which version to keep.{" "}
						{selectedVersion === "local" ? "Your changes" : "Server changes"}{" "}
						will be saved.
					</p>
					<div className="flex items-center gap-3">
						<button
							onClick={onClose}
							className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={handleResolve}
							className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold text-white transition-all"
						>
							Resolve Conflict
							<ArrowRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
