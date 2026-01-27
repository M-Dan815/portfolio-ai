import React, {useState} from "react";
import {Code, Loader2, X, AlertCircle} from "lucide-react";
import MonacoEditor, {getFileIcon} from "./MonacoEditor";

// Editor Tab Component
function EditorTab({file, isActive, onClose, onSelect, hasUnsavedChanges}) {
	const fileName = file.split("/").pop();
	const icon = getFileIcon(fileName);

	return (
		<div
			onClick={onSelect}
			className={`group flex items-center gap-2 px-4 py-2 border-r border-white/10 cursor-pointer transition-colors relative ${
				isActive
					? "bg-slate-950 text-white"
					: "bg-slate-900/50 text-gray-400 hover:text-white hover:bg-slate-900"
			}`}
		>
			<span className="text-sm">{icon}</span>
			<span className="text-sm max-w-[120px] truncate">{fileName}</span>

			{hasUnsavedChanges && (
				<div
					className="w-2 h-2 bg-blue-500 rounded-full"
					title="Unsaved changes"
				/>
			)}

			<button
				onClick={(e) => {
					e.stopPropagation();
					onClose();
				}}
				className="ml-1 p-0.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-opacity"
			>
				<X className="w-3.5 h-3.5" />
			</button>

			{isActive && (
				<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
			)}
		</div>
	);
}

export default function EditorPanel({
	openFiles = [],
	activeFile,
	fileContents = {},
	unsavedFiles = new Set(),
	onChangeFile,
	onSelectFile,
	onCloseFile,
	loading,
}) {
	const [error, setError] = useState(null);

	const handleEditorChange = (value) => {
		if (activeFile && onChangeFile) {
			onChangeFile(activeFile, value);
		}
	};

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center bg-slate-950">
				<div className="text-center">
					<Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
					<p className="text-gray-400">Loading file...</p>
				</div>
			</div>
		);
	}

	if (openFiles.length === 0) {
		return (
			<div className="h-full flex items-center justify-center bg-slate-950">
				<div className="text-center">
					<Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
					<p className="text-xl font-semibold text-white mb-2">No File Open</p>
					<p className="text-gray-400">
						Select a file from the sidebar to start editing
					</p>
				</div>
			</div>
		);
	}

	const activeContent = activeFile ? fileContents[activeFile] || "" : "";

	return (
		<div className="h-full flex flex-col bg-slate-950">
			{/* Tabs */}
			<div className="flex items-center bg-slate-900/50 border-b border-white/10 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
				{openFiles.map((file) => (
					<EditorTab
						key={file}
						file={file}
						isActive={file === activeFile}
						hasUnsavedChanges={unsavedFiles.has(file)}
						onSelect={() => onSelectFile(file)}
						onClose={() => onCloseFile(file)}
					/>
				))}
			</div>

			{/* Editor */}
			<div className="flex-1 overflow-hidden">
				{error ? (
					<div className="h-full flex items-center justify-center p-8">
						<div className="text-center max-w-md">
							<AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
							<p className="text-red-400 mb-2">Editor Error</p>
							<p className="text-sm text-gray-400">{error}</p>
						</div>
					</div>
				) : (
					<MonacoEditor
						value={activeContent}
						onChange={handleEditorChange}
						filePath={activeFile}
						theme="custom-dark"
					/>
				)}
			</div>

			{/* Status Bar */}
			<div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/80 border-t border-white/10 text-xs">
				<div className="flex items-center gap-4">
					<span className="text-gray-400">{activeFile || "No file"}</span>
					{unsavedFiles.has(activeFile) && (
						<span className="text-yellow-400">● Unsaved</span>
					)}
				</div>
				<div className="flex items-center gap-4 text-gray-500">
					<span>UTF-8</span>
					<span>LF</span>
					{activeFile && (
						<span className="capitalize">{activeFile.split(".").pop()}</span>
					)}
				</div>
			</div>
		</div>
	);
}
