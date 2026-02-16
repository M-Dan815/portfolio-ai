// Updated Editor.jsx

import React, {useState, useEffect, useCallback, useRef} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useProject} from "../context/ProjectContext";
import {useWebSocketContext} from "../context/WebSocketContext";
import api from "../api";

// Components
import EditorHeader from "../components/editor/EditorHeader";
import FileTree from "../components/editor/FileTree";
import EditorPanel from "../components/editor/EditorPanel";
import PreviewPanel from "../components/editor/PreviewPanel";
import ResizablePanel from "../components/editor/ResizablePanel";
import AIGenerateModal from "../components/editor/AIGenerateModal";
import ChatPanel from "../components/editor/ChatPanel";
import DeploymentOverlay from "../components/editor/DeploymentOverlay";
import {Loader2, MessageSquare} from "lucide-react";

/**
 * Convert flat file list to hierarchical tree structure
 */
function buildFileTree(files) {
	if (!files || !Array.isArray(files)) {
		return [];
	}

	const root = [];
	const map = {};

	const sortedFiles = [...files].sort((a, b) => {
		const pathA = a.path || a;
		const pathB = b.path || b;
		return pathA.localeCompare(pathB);
	});

	sortedFiles.forEach((file) => {
		const filePath = typeof file === "string" ? file : file.path;
		const parts = filePath.split("/");
		const fileName = parts[parts.length - 1];

		const node = {
			path: filePath,
			name: fileName,
			type: fileName.includes(".") ? "file" : "directory",
			children: [],
			...(typeof file === "object" ? file : {}),
		};

		map[filePath] = node;

		if (parts.length === 1) {
			root.push(node);
		} else {
			let currentPath = "";
			for (let i = 0; i < parts.length - 1; i++) {
				const part = parts[i];
				const prevPath = currentPath;
				currentPath = currentPath ? `${currentPath}/${part}` : part;

				if (!map[currentPath]) {
					const dirNode = {
						path: currentPath,
						name: part,
						type: "directory",
						children: [],
					};
					map[currentPath] = dirNode;

					if (prevPath && map[prevPath]) {
						map[prevPath].children.push(dirNode);
					} else if (!prevPath) {
						root.push(dirNode);
					}
				}
			}

			const parentPath = parts.slice(0, -1).join("/");
			if (map[parentPath]) {
				if (!map[parentPath].children.find((c) => c.path === node.path)) {
					map[parentPath].children.push(node);
				}
			}
		}
	});

	return root;
}

export default function Editor() {
	const {projectId} = useParams();
	const navigate = useNavigate();
	const {currentProject, setCurrentProject} = useProject();
	const ws = useWebSocketContext();

	// State
	const [fileTree, setFileTree] = useState([]);
	const [openFiles, setOpenFiles] = useState([]);
	const [activeFile, setActiveFile] = useState(null);
	const [fileContents, setFileContents] = useState({});
	const [originalContents, setOriginalContents] = useState({});
	const [unsavedFiles, setUnsavedFiles] = useState(new Set());

	// All files for Sandpack
	const [allFilesContent, setAllFilesContent] = useState({});

	const [loading, setLoading] = useState(true);
	const [fileLoading, setFileLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [building, setBuilding] = useState(false);
	const [lastSaved, setLastSaved] = useState(null);

	// Generation status
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationProgress, setGenerationProgress] = useState(0);
	const [generationStep, setGenerationStep] = useState("");
	const generationPollRef = useRef(null);

	const [showAIModal, setShowAIModal] = useState(false);
	const [generating, setGenerating] = useState(false);

	// Chat panel state
	const [showChatPanel, setShowChatPanel] = useState(false);

	// Deployment state
	const [showDeploymentOverlay, setShowDeploymentOverlay] = useState(false);
	const [deploying, setDeploying] = useState(false);

	const [previewUrl, setPreviewUrl] = useState(null);
	const [previewLoading, setPreviewLoading] = useState(false);
	const [previewError, setPreviewError] = useState(null);
	const [previewKey, setPreviewKey] = useState(0);

	// Load project
	useEffect(() => {
		if (projectId) {
			loadProject();
		}

		return () => {
			if (generationPollRef.current) {
				clearInterval(generationPollRef.current);
			}
		};
	}, [projectId]);

	// Warn before leaving with unsaved changes
	useEffect(() => {
		const handleBeforeUnload = (e) => {
			if (unsavedFiles.size > 0) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [unsavedFiles]);

	const loadProject = async () => {
		try {
			setLoading(true);
			console.log("Loading project:", projectId);

			const project = await api.getProject(projectId);
			console.log("Project loaded:", project);
			setCurrentProject(project);

			if (project.status === "generating") {
				setIsGenerating(true);
				startGenerationPolling();
			}

			await loadFiles();
			setPreviewUrl(api.getPreviewUrl(projectId));
		} catch (error) {
			console.error("Failed to load project:", error);
			alert("Failed to load project: " + error.message);
			navigate("/dashboard/projects");
		} finally {
			setLoading(false);
		}
	};

	const loadFiles = async () => {
		try {
			const treeResponse = await api.getFileTree(projectId);
			console.log("File tree response:", treeResponse);

			const files =
				treeResponse.files || treeResponse.tree || treeResponse || [];
			const tree = buildFileTree(files);
			console.log("Built file tree:", tree);
			setFileTree(tree);

			const allFiles = await api.getAllFiles(projectId);
			console.log("All files response:", allFiles);

			const filesContent = allFiles.files || allFiles || {};
			console.log("Files content keys:", Object.keys(filesContent));
			setAllFilesContent(filesContent);

			setPreviewKey((prev) => prev + 1);

			if (!activeFile) {
				const firstFile = findFirstEditableFile(tree);
				if (firstFile) {
					console.log("Auto-selecting file:", firstFile.path);
					await handleSelectFile(firstFile.path);
				}
			}

			return filesContent;
		} catch (err) {
			console.error("Failed to load files:", err);
			return {};
		}
	};

	const startGenerationPolling = () => {
		if (generationPollRef.current) {
			clearInterval(generationPollRef.current);
		}

		console.log("Starting generation polling...");

		generationPollRef.current = setInterval(async () => {
			try {
				const status = await api.getGenerationStatus(projectId);
				console.log("Generation status:", status);

				setGenerationProgress(status.progress || 0);
				setGenerationStep(status.current_step || "Generating...");

				if (status.status === "completed" || status.status === "ready") {
					console.log("Generation complete! Reloading files...");
					setIsGenerating(false);
					clearInterval(generationPollRef.current);
					generationPollRef.current = null;

					const project = await api.getProject(projectId);
					setCurrentProject(project);
					await loadFiles();
				} else if (status.status === "failed" || status.status === "error") {
					setIsGenerating(false);
					clearInterval(generationPollRef.current);
					generationPollRef.current = null;
					console.error("Generation failed:", status.error_message);
				}
			} catch (error) {
				console.error("Error polling generation status:", error);
			}
		}, 2000);
	};

	const findFirstEditableFile = (nodes) => {
		for (const node of nodes) {
			if (
				node.type === "file" &&
				!node.path.includes("node_modules") &&
				(node.path.endsWith(".jsx") ||
					node.path.endsWith(".js") ||
					node.path.endsWith(".tsx"))
			) {
				return node;
			}
			if (node.children) {
				const found = findFirstEditableFile(node.children);
				if (found) return found;
			}
		}
		for (const node of nodes) {
			if (node.type === "file" && !node.path.includes("node_modules")) {
				return node;
			}
			if (node.children) {
				const found = findFirstEditableFile(node.children);
				if (found) return found;
			}
		}
		return null;
	};

	const handleSelectFile = async (filePath) => {
		console.log("Selecting file:", filePath);

		// If file is already open, just make it active
		if (openFiles.includes(filePath)) {
			setActiveFile(filePath);
			return;
		}

		try {
			setFileLoading(true);

			let content = allFilesContent[filePath];

			if (content === undefined) {
				const fileData = await api.getFile(projectId, filePath);
				content = fileData.content || "";
				setAllFilesContent((prev) => ({...prev, [filePath]: content}));
			}

			// Use Set to guarantee uniqueness
			setOpenFiles((prev) => {
				if (prev.includes(filePath)) {
					return prev; // Already exists, don't add again
				}
				return [...prev, filePath];
			});

			setFileContents((prev) => ({...prev, [filePath]: content}));
			setOriginalContents((prev) => ({...prev, [filePath]: content}));
			setActiveFile(filePath);
		} catch (error) {
			console.error("Failed to load file:", error);
			alert("Failed to load file: " + error.message);
		} finally {
			setFileLoading(false);
		}
	};

	const handleCloseFile = (filePath) => {
		if (unsavedFiles.has(filePath)) {
			const confirm = window.confirm(
				`${filePath.split("/").pop()} has unsaved changes. Close anyway?`,
			);
			if (!confirm) return;
		}

		setOpenFiles((prev) => prev.filter((f) => f !== filePath));
		setFileContents((prev) => {
			const next = {...prev};
			delete next[filePath];
			return next;
		});
		setOriginalContents((prev) => {
			const next = {...prev};
			delete next[filePath];
			return next;
		});
		setUnsavedFiles((prev) => {
			const next = new Set(prev);
			next.delete(filePath);
			return next;
		});

		if (filePath === activeFile) {
			const remainingFiles = openFiles.filter((f) => f !== filePath);
			setActiveFile(
				remainingFiles.length > 0
					? remainingFiles[remainingFiles.length - 1]
					: null,
			);
		}
	};

	const handleFileContentChange = (filePath, newContent) => {
		setFileContents((prev) => ({...prev, [filePath]: newContent}));
		setAllFilesContent((prev) => ({...prev, [filePath]: newContent}));
		setPreviewKey((prev) => prev + 1);

		const isUnsaved = newContent !== originalContents[filePath];
		setUnsavedFiles((prev) => {
			const next = new Set(prev);
			if (isUnsaved) {
				next.add(filePath);
			} else {
				next.delete(filePath);
			}
			return next;
		});
	};

	const handleSave = async () => {
		if (unsavedFiles.size === 0) return;

		try {
			setSaving(true);

			const savePromises = Array.from(unsavedFiles).map((filePath) =>
				api.updateFile(projectId, filePath, fileContents[filePath]),
			);

			await Promise.all(savePromises);

			setOriginalContents((prev) => {
				const next = {...prev};
				unsavedFiles.forEach((filePath) => {
					next[filePath] = fileContents[filePath];
				});
				return next;
			});

			setUnsavedFiles(new Set());
			setLastSaved(Date.now());
		} catch (error) {
			console.error("Failed to save files:", error);
			alert("Failed to save files: " + error.message);
		} finally {
			setSaving(false);
		}
	};

	const handleBuild = async () => {
		if (unsavedFiles.size > 0) {
			await handleSave();
		}

		try {
			setBuilding(true);
			await api.buildProject(projectId);

			let attempts = 0;
			const maxAttempts = 60;
			const checkStatus = async () => {
				if (attempts >= maxAttempts) {
					setBuilding(false);
					alert("Build timed out. Please try again.");
					return;
				}

				try {
					const status = await api.getBuildStatus(projectId);
					console.log("Build status:", status);

					if (status.status === "built" || status.status === "completed") {
						setBuilding(false);
						handleRefreshPreview();
					} else if (status.status === "failed" || status.status === "error") {
						setBuilding(false);
						alert("Build failed: " + (status.error_message || "Unknown error"));
					} else {
						attempts++;
						setTimeout(checkStatus, 2000);
					}
				} catch (error) {
					attempts++;
					setTimeout(checkStatus, 2000);
				}
			};

			setTimeout(checkStatus, 2000);
		} catch (error) {
			console.error("Failed to build project:", error);
			alert("Failed to build project: " + error.message);
			setBuilding(false);
		}
	};

	const handleDeploy = async () => {
		// Save any unsaved changes first
		if (unsavedFiles.size > 0) {
			await handleSave();
		}

		try {
			setDeploying(true);
			setShowDeploymentOverlay(true);

			// Trigger the deployment
			await api.deployProject(projectId);
		} catch (error) {
			console.error("Failed to start deployment:", error);
			setShowDeploymentOverlay(false);
			alert("Failed to start deployment: " + error.message);
		} finally {
			setDeploying(false);
		}
	};

	const handleDeploymentComplete = (deployStatus) => {
		console.log("Deployment complete:", deployStatus);
		// Update project with new deploy URL
		setCurrentProject((prev) => ({
			...prev,
			is_deployed: true,
			deploy_url: deployStatus.deploy_url,
		}));
	};

	const handlePreview = () => {
		if (previewUrl) {
			window.open(previewUrl, "_blank");
		}
	};

	const handleDownload = async () => {
		try {
			await api.downloadProject(projectId);
		} catch (error) {
			console.error("Failed to download project:", error);
			alert("Failed to download project: " + error.message);
		}
	};

	const handleRefreshPreview = () => {
		setPreviewKey((prev) => prev + 1);
		loadFiles();
	};

	const handleCreateFile = async (path) => {
		try {
			await api.createFile(projectId, path, "");
			await loadFiles();
			handleSelectFile(path);
		} catch (error) {
			console.error("Failed to create file:", error);
			alert("Failed to create file: " + error.message);
		}
	};

	const handleRenameFile = async (oldPath, newPath) => {
		try {
			await api.renameFile(projectId, oldPath, newPath);
			await loadFiles();

			if (openFiles.includes(oldPath)) {
				setOpenFiles((prev) => prev.map((f) => (f === oldPath ? newPath : f)));
				setFileContents((prev) => {
					const next = {...prev};
					next[newPath] = next[oldPath];
					delete next[oldPath];
					return next;
				});
				setOriginalContents((prev) => {
					const next = {...prev};
					next[newPath] = next[oldPath];
					delete next[oldPath];
					return next;
				});
				if (activeFile === oldPath) {
					setActiveFile(newPath);
				}
			}
		} catch (error) {
			console.error("Failed to rename file:", error);
			alert("Failed to rename file: " + error.message);
		}
	};

	const handleDeleteFile = async (path) => {
		try {
			await api.deleteFile(projectId, path);
			await loadFiles();

			if (openFiles.includes(path)) {
				handleCloseFile(path);
			}
		} catch (error) {
			console.error("Failed to delete file:", error);
			alert("Failed to delete file: " + error.message);
		}
	};

	const handleGenerateComponent = async (data) => {
		try {
			setGenerating(true);
			const result = await api.generateComponent(
				projectId,
				data.description,
				data.componentName,
				data.targetPath,
			);

			await loadFiles();

			if (result.path || result.file_path) {
				handleSelectFile(result.path || result.file_path);
			}
		} catch (error) {
			console.error("Failed to generate component:", error);
			throw error;
		} finally {
			setGenerating(false);
		}
	};

	// Handle chat-initiated file changes
	const handleChatFilesChanged = async (filesChanged) => {
		console.log("Chat files changed:", filesChanged);

		// Reload all files to get the updates
		await loadFiles();

		// If any of the changed files are currently open, reload their content
		for (const change of filesChanged) {
			const filePath = change.path || change;
			if (openFiles.includes(filePath)) {
				// Update the file content in the editor
				const newContent = allFilesContent[filePath];
				if (newContent !== undefined) {
					setFileContents((prev) => ({...prev, [filePath]: newContent}));
					setOriginalContents((prev) => ({...prev, [filePath]: newContent}));
				}
			}
		}

		// Refresh preview
		setPreviewKey((prev) => prev + 1);

		// Refresh chatbot context to ensure it has the latest files
		try {
			await api.refreshChatContext(projectId);
		} catch (err) {
			console.error("Failed to refresh chat context:", err);
		}
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				e.preventDefault();
				handleSave();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === "b") {
				e.preventDefault();
				handleBuild();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === "w") {
				e.preventDefault();
				if (activeFile) {
					handleCloseFile(activeFile);
				}
			}
			// Toggle chat with Ctrl/Cmd + /
			if ((e.ctrlKey || e.metaKey) && e.key === "/") {
				e.preventDefault();
				setShowChatPanel((prev) => !prev);
			}
			// Deploy with Ctrl/Cmd + Shift + D
			if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D") {
				e.preventDefault();
				handleDeploy();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [activeFile, unsavedFiles, fileContents, originalContents]);

	if (loading) {
		return (
			<div className="h-screen bg-slate-950 flex items-center justify-center">
				<div className="text-center">
					<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
					<p className="text-gray-400">Loading editor...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
			{/* Generation Progress Bar */}
			{isGenerating && (
				<div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-blue-500/30 px-4 py-3">
					<div className="flex items-center gap-3">
						<Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
						<div className="flex-1">
							<div className="flex items-center justify-between mb-1">
								<span className="text-sm text-blue-400 font-medium">
									{generationStep || "Generating portfolio..."}
								</span>
								<span className="text-sm text-gray-400">
									{generationProgress}%
								</span>
							</div>
							<div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
									style={{width: `${generationProgress}%`}}
								/>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Header */}
			<EditorHeader
				project={currentProject}
				onSave={handleSave}
				onBuild={handleBuild}
				onDeploy={handleDeploy}
				onPreview={handlePreview}
				onDownload={handleDownload}
				onGenerateComponent={() => setShowAIModal(true)}
				onOpenChat={() => setShowChatPanel(true)}
				saving={saving}
				building={building}
				deploying={deploying}
				lastSaved={lastSaved}
				hasUnsavedChanges={unsavedFiles.size > 0}
				wsConnected={ws?.isConnected || false}
				wsConnecting={ws?.isConnecting || false}
				wsError={ws?.connectionError}
				onReconnect={ws?.reconnect}
				chatOpen={showChatPanel}
			/>

			{/* Main Content */}
			<div className="flex-1 overflow-hidden relative">
				<ResizablePanel
					left={
						<div className="h-full bg-slate-900 border-r border-white/10">
							<FileTree
								fileTree={fileTree}
								selectedFile={activeFile}
								onSelectFile={handleSelectFile}
								onCreateFile={handleCreateFile}
								onRenameFile={handleRenameFile}
								onDeleteFile={handleDeleteFile}
								loading={false}
							/>
						</div>
					}
					right={
						<ResizablePanel
							left={
								<EditorPanel
									openFiles={openFiles}
									activeFile={activeFile}
									fileContents={fileContents}
									unsavedFiles={unsavedFiles}
									onChangeFile={handleFileContentChange}
									onSelectFile={setActiveFile}
									onCloseFile={handleCloseFile}
									loading={fileLoading}
								/>
							}
							right={
								<PreviewPanel
									key={previewKey}
									projectId={projectId}
									files={allFilesContent}
									activeFile={activeFile}
									previewMode="sandpack"
									previewUrl={previewUrl}
									loading={previewLoading || isGenerating}
									error={previewError}
									onRefresh={handleRefreshPreview}
									template="react"
								/>
							}
							defaultLeftWidth={window.innerWidth * 0.35}
							minLeftWidth={300}
							maxLeftWidth={window.innerWidth * 0.6}
						/>
					}
					defaultLeftWidth={240}
					minLeftWidth={180}
					maxLeftWidth={400}
				/>

				{/* Floating Chat Button (when panel is closed) */}
				{!showChatPanel && (
					<button
						onClick={() => setShowChatPanel(true)}
						className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 
                       hover:from-purple-600 hover:to-blue-600 rounded-full shadow-lg shadow-purple-500/25
                       flex items-center justify-center text-white transition-all hover:scale-105
                       z-40"
						title="Open AI Chat (Ctrl+/)"
					>
						<MessageSquare className="w-6 h-6" />
					</button>
				)}

				{/* Chat Panel */}
				<ChatPanel
					projectId={projectId}
					isOpen={showChatPanel}
					onClose={() => setShowChatPanel(false)}
					onFilesChanged={handleChatFilesChanged}
					colorScheme={currentProject?.color_scheme || "blue"}
				/>
			</div>

			{/* AI Generate Modal */}
			<AIGenerateModal
				isOpen={showAIModal}
				onClose={() => setShowAIModal(false)}
				onGenerate={handleGenerateComponent}
				generating={generating}
			/>

			{/* Deployment Overlay */}
			<DeploymentOverlay
				projectId={projectId}
				isVisible={showDeploymentOverlay}
				onComplete={handleDeploymentComplete}
				onClose={() => setShowDeploymentOverlay(false)}
			/>
		</div>
	);
}
