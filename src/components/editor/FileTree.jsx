import React, {useState} from "react";
import {
	ChevronRight,
	ChevronDown,
	File,
	Folder,
	FolderOpen,
	Plus,
	MoreVertical,
	Edit2,
	Trash2,
	FileCode,
	FileText,
	FileJson,
	Image as ImageIcon,
	Code,
} from "lucide-react";

// File icon mapping
const getFileIcon = (fileName) => {
	const ext = fileName.split(".").pop()?.toLowerCase();
	const iconMap = {
		jsx: <FileCode className="w-4 h-4 text-blue-400" />,
		js: <FileCode className="w-4 h-4 text-yellow-400" />,
		tsx: <FileCode className="w-4 h-4 text-blue-500" />,
		ts: <FileCode className="w-4 h-4 text-blue-600" />,
		css: <Code className="w-4 h-4 text-pink-400" />,
		json: <FileJson className="w-4 h-4 text-green-400" />,
		md: <FileText className="w-4 h-4 text-gray-400" />,
		png: <ImageIcon className="w-4 h-4 text-purple-400" />,
		jpg: <ImageIcon className="w-4 h-4 text-purple-400" />,
		svg: <ImageIcon className="w-4 h-4 text-orange-400" />,
		html: <FileCode className="w-4 h-4 text-orange-500" />,
	};
	return iconMap[ext] || <File className="w-4 h-4 text-gray-400" />;
};

// File Tree Item Component
function FileTreeItem({
	node,
	level = 0,
	selectedFile,
	onSelectFile,
	onCreateFile,
	onRenameFile,
	onDeleteFile,
	expandedFolders,
	onToggleFolder,
}) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [renaming, setRenaming] = useState(false);
	const [newName, setNewName] = useState(node.name);

	const isFolder = node.type === "directory";
	const isExpanded = expandedFolders.has(node.path);
	const isSelected = selectedFile === node.path;

	const handleToggle = () => {
		if (isFolder) {
			onToggleFolder(node.path);
		} else {
			onSelectFile(node.path);
		}
	};

	const handleRename = () => {
		if (newName && newName !== node.name) {
			const newPath = node.path.replace(node.name, newName);
			onRenameFile(node.path, newPath);
		}
		setRenaming(false);
		setMenuOpen(false);
	};

	const handleDelete = () => {
		if (confirm(`Are you sure you want to delete ${node.name}?`)) {
			onDeleteFile(node.path);
		}
		setMenuOpen(false);
	};

	return (
		<div>
			<div
				className={`group flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-lg transition-colors ${
					isSelected
						? "bg-blue-500/20 text-blue-400"
						: "hover:bg-white/5 text-gray-300 hover:text-white"
				}`}
				style={{paddingLeft: `${level * 12 + 8}px`}}
				onClick={handleToggle}
			>
				{/* Expand/Collapse Icon */}
				{isFolder && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							onToggleFolder(node.path);
						}}
						className="flex-shrink-0"
					>
						{isExpanded ? (
							<ChevronDown className="w-4 h-4" />
						) : (
							<ChevronRight className="w-4 h-4" />
						)}
					</button>
				)}
				{!isFolder && <div className="w-4" />}

				{/* Icon */}
				<div className="flex-shrink-0">
					{isFolder ? (
						isExpanded ? (
							<FolderOpen className="w-4 h-4 text-blue-400" />
						) : (
							<Folder className="w-4 h-4 text-blue-400" />
						)
					) : (
						getFileIcon(node.name)
					)}
				</div>

				{/* Name */}
				{renaming ? (
					<input
						type="text"
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						onBlur={handleRename}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleRename();
							if (e.key === "Escape") {
								setRenaming(false);
								setNewName(node.name);
							}
						}}
						onClick={(e) => e.stopPropagation()}
						className="flex-1 px-1 py-0.5 bg-white/10 border border-blue-500 rounded text-sm text-white focus:outline-none"
						autoFocus
					/>
				) : (
					<span className="flex-1 text-sm truncate">{node.name}</span>
				)}

				{/* Actions Menu */}
				{!renaming && (
					<div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
						<button
							onClick={(e) => {
								e.stopPropagation();
								setMenuOpen(!menuOpen);
							}}
							className="p-1 hover:bg-white/10 rounded transition-colors"
						>
							<MoreVertical className="w-3.5 h-3.5" />
						</button>

						{menuOpen && (
							<>
								<div
									className="fixed inset-0 z-10"
									onClick={() => setMenuOpen(false)}
								/>
								<div className="absolute right-0 mt-1 w-40 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden">
									{isFolder && (
										<button
											onClick={(e) => {
												e.stopPropagation();
												onCreateFile(node.path);
												setMenuOpen(false);
											}}
											className="flex items-center w-full px-3 py-2 text-xs text-gray-300 hover:bg-white/10 transition-colors"
										>
											<Plus className="w-3.5 h-3.5 mr-2" />
											New File
										</button>
									)}
									<button
										onClick={(e) => {
											e.stopPropagation();
											setRenaming(true);
											setMenuOpen(false);
										}}
										className="flex items-center w-full px-3 py-2 text-xs text-gray-300 hover:bg-white/10 transition-colors"
									>
										<Edit2 className="w-3.5 h-3.5 mr-2" />
										Rename
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleDelete();
										}}
										className="flex items-center w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
									>
										<Trash2 className="w-3.5 h-3.5 mr-2" />
										Delete
									</button>
								</div>
							</>
						)}
					</div>
				)}
			</div>

			{/* Children */}
			{isFolder && isExpanded && node.children && (
				<div>
					{node.children.map((child) => (
						<FileTreeItem
							key={child.path}
							node={child}
							level={level + 1}
							selectedFile={selectedFile}
							onSelectFile={onSelectFile}
							onCreateFile={onCreateFile}
							onRenameFile={onRenameFile}
							onDeleteFile={onDeleteFile}
							expandedFolders={expandedFolders}
							onToggleFolder={onToggleFolder}
						/>
					))}
				</div>
			)}
		</div>
	);
}

// Main File Tree Component
export default function FileTree({
	fileTree,
	selectedFile,
	onSelectFile,
	onCreateFile,
	onRenameFile,
	onDeleteFile,
	loading,
}) {
	const [expandedFolders, setExpandedFolders] = useState(
		new Set(["src", "public"]),
	);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newFileName, setNewFileName] = useState("");

	const handleToggleFolder = (path) => {
		setExpandedFolders((prev) => {
			const next = new Set(prev);
			if (next.has(path)) {
				next.delete(path);
			} else {
				next.add(path);
			}
			return next;
		});
	};

	const handleCreateFileSubmit = () => {
		if (newFileName.trim()) {
			onCreateFile(newFileName.trim());
			setNewFileName("");
			setShowCreateModal(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center">
					<div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
					<p className="text-xs text-gray-500">Loading files...</p>
				</div>
			</div>
		);
	}

	if (!fileTree || fileTree.length === 0) {
		return (
			<div className="flex items-center justify-center h-full p-4">
				<div className="text-center">
					<Folder className="w-12 h-12 text-gray-600 mx-auto mb-3" />
					<p className="text-sm text-gray-400">No files</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			{/* Header */}
			<div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
				<span className="text-xs font-semibold text-gray-400 uppercase">
					Files
				</span>
				<button
					onClick={() => setShowCreateModal(true)}
					className="p-1 hover:bg-white/10 rounded transition-colors"
					title="New File"
				>
					<Plus className="w-4 h-4 text-gray-400" />
				</button>
			</div>

			{/* File Tree */}
			<div className="flex-1 overflow-y-auto py-2">
				{fileTree.map((node) => (
					<FileTreeItem
						key={node.path}
						node={node}
						selectedFile={selectedFile}
						onSelectFile={onSelectFile}
						onCreateFile={onCreateFile}
						onRenameFile={onRenameFile}
						onDeleteFile={onDeleteFile}
						expandedFolders={expandedFolders}
						onToggleFolder={handleToggleFolder}
					/>
				))}
			</div>

			{/* Create File Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
						onClick={() => setShowCreateModal(false)}
					/>
					<div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-xl p-6">
						<h3 className="text-lg font-semibold text-white mb-4">
							Create New File
						</h3>
						<input
							type="text"
							value={newFileName}
							onChange={(e) => setNewFileName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleCreateFileSubmit();
								if (e.key === "Escape") setShowCreateModal(false);
							}}
							placeholder="src/components/MyComponent.jsx"
							className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
							autoFocus
						/>
						<div className="flex justify-end gap-2">
							<button
								onClick={() => setShowCreateModal(false)}
								className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleCreateFileSubmit}
								className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
							>
								Create
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
