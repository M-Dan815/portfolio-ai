// src/components/editor/ChatPanel.jsx

import React, {useState, useRef, useEffect} from "react";
import {
	X,
	Send,
	Loader2,
	Bot,
	User,
	Sparkles,
	FileCode,
	RefreshCw,
	Trash2,
	CheckCircle,
	AlertCircle,
	Eye,
	Play,
	Image as ImageIcon,
	Upload,
	XCircle,
} from "lucide-react";
import api from "../../api";

function ChatMessage({message, isUser, filesChanged, imagesAdded, timestamp}) {
	return (
		<div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
			{/* Avatar */}
			<div
				className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
					isUser
						? "bg-blue-500/20 text-blue-400"
						: "bg-purple-500/20 text-purple-400"
				}`}
			>
				{isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
			</div>

			{/* Content */}
			<div className={`flex-1 max-w-[85%] ${isUser ? "text-right" : ""}`}>
				<div
					className={`inline-block px-4 py-2.5 rounded-2xl ${
						isUser
							? "bg-blue-600 text-white rounded-tr-md"
							: "bg-white/10 text-gray-100 rounded-tl-md"
					}`}
				>
					<p className="text-sm whitespace-pre-wrap">{message}</p>
				</div>

				{/* Files changed indicator */}
				{filesChanged && filesChanged.length > 0 && (
					<div className="mt-2 space-y-1">
						{filesChanged.map((file, idx) => (
							<div
								key={idx}
								className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-lg mr-1"
							>
								<FileCode className="w-3 h-3" />
								<span>{file.path || file}</span>
								{file.action && (
									<span className="text-green-300/60">({file.action})</span>
								)}
							</div>
						))}
					</div>
				)}

				{/* Images added indicator */}
				{imagesAdded && imagesAdded.length > 0 && (
					<div className="mt-2 space-y-1">
						{imagesAdded.map((img, idx) => (
							<div
								key={idx}
								className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-lg mr-1"
							>
								<ImageIcon className="w-3 h-3" />
								<span>{img}</span>
							</div>
						))}
					</div>
				)}

				{/* Timestamp */}
				{timestamp && (
					<p className="text-xs text-gray-500 mt-1">
						{new Date(timestamp).toLocaleTimeString()}
					</p>
				)}
			</div>
		</div>
	);
}

function SuggestionChip({text, onClick}) {
	return (
		<button
			onClick={onClick}
			className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 
                 rounded-full text-xs text-gray-300 hover:text-white transition-all
                 hover:border-purple-500/30"
		>
			{text}
		</button>
	);
}

function ImagePreview({file, onRemove}) {
	const [preview, setPreview] = useState(null);

	useEffect(() => {
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => setPreview(reader.result);
			reader.readAsDataURL(file);
		}
	}, [file]);

	return (
		<div className="relative inline-block">
			<div className="w-16 h-16 rounded-lg overflow-hidden border border-white/20">
				{preview ? (
					<img
						src={preview}
						alt="Preview"
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full bg-white/5 flex items-center justify-center">
						<ImageIcon className="w-6 h-6 text-gray-500" />
					</div>
				)}
			</div>
			<button
				onClick={onRemove}
				className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
			>
				<X className="w-3 h-3" />
			</button>
		</div>
	);
}

export default function ChatPanel({
	projectId,
	isOpen,
	onClose,
	onFilesChanged,
	colorScheme = "blue",
}) {
	const [messages, setMessages] = useState([]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [suggestions, setSuggestions] = useState([
		"Make the hero section more dynamic",
		"Add animations to the skill cards",
		"Add a profile photo to the hero",
		"Add a testimonials section",
	]);
	const [error, setError] = useState(null);
	const [previewMode, setPreviewMode] = useState(false);
	const [pendingChanges, setPendingChanges] = useState([]);

	// Image upload state
	const [selectedImages, setSelectedImages] = useState([]);
	const [imagePurpose, setImagePurpose] = useState("add_to_project");
	const [imageTargetPath, setImageTargetPath] = useState("");
	const [showImageOptions, setShowImageOptions] = useState(false);

	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);
	const fileInputRef = useRef(null);

	// Auto-scroll to bottom
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({behavior: "smooth"});
		}
	}, [messages]);

	// Focus input when panel opens
	useEffect(() => {
		if (isOpen && inputRef.current) {
			setTimeout(() => inputRef.current?.focus(), 300);
		}
	}, [isOpen]);

	// Load chat history on mount
	useEffect(() => {
		if (isOpen && projectId) {
			loadChatHistory();
		}
	}, [isOpen, projectId]);

	const loadChatHistory = async () => {
		try {
			const response = await api.getChatHistory(projectId);
			if (response.history && response.history.length > 0) {
				const formattedMessages = response.history.map((msg) => ({
					id: Date.now() + Math.random(),
					content: msg.content,
					isUser: msg.role === "user",
					filesChanged: msg.files_changed || [],
					imagesAdded: msg.images || [],
					timestamp: msg.timestamp,
				}));
				setMessages(formattedMessages);
			}
		} catch (err) {
			console.error("Failed to load chat history:", err);
		}
	};

	const handleImageSelect = (e) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 0) {
			setSelectedImages((prev) => [...prev, ...files]);
			setShowImageOptions(true);
		}
		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleRemoveImage = (index) => {
		setSelectedImages((prev) => prev.filter((_, i) => i !== index));
		if (selectedImages.length <= 1) {
			setShowImageOptions(false);
		}
	};

	const handleSend = async (messageText = inputValue) => {
		if ((!messageText.trim() && selectedImages.length === 0) || isLoading)
			return;

		const userMessage = {
			id: Date.now(),
			content:
				messageText.trim() ||
				(selectedImages.length > 0
					? `[Sent ${selectedImages.length} image(s)]`
					: ""),
			isUser: true,
			timestamp: new Date().toISOString(),
			imagesAdded: selectedImages.map((f) => f.name),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setIsLoading(true);
		setError(null);

		try {
			const response = await api.chatWithProject(
				projectId,
				messageText.trim(),
				{
					auto_apply: !previewMode,
					images: selectedImages,
					image_purpose: imagePurpose,
					image_target_path: imageTargetPath,
				},
			);

			// Clear images after sending
			setSelectedImages([]);
			setShowImageOptions(false);
			setImageTargetPath("");

			if (response.error) {
				setError(response.error);
				setMessages((prev) => [
					...prev,
					{
						id: Date.now(),
						content: `Error: ${response.error}`,
						isUser: false,
						timestamp: new Date().toISOString(),
					},
				]);
			} else {
				const aiMessage = {
					id: Date.now(),
					content: response.message,
					isUser: false,
					filesChanged: response.files_changed || [],
					imagesAdded: response.images_added || [],
					timestamp: new Date().toISOString(),
				};

				setMessages((prev) => [...prev, aiMessage]);

				if (response.suggestions && response.suggestions.length > 0) {
					setSuggestions(response.suggestions);
				}

				if (response.files_changed && response.files_changed.length > 0) {
					if (previewMode) {
						setPendingChanges(response.files_changed);
					} else {
						onFilesChanged?.(response.files_changed);
					}
				}

				// Also trigger refresh if images were added
				if (response.images_added && response.images_added.length > 0) {
					onFilesChanged?.(
						response.images_added.map((path) => ({path, action: "create"})),
					);
				}
			}
		} catch (err) {
			console.error("Chat error:", err);
			setError(err.message);
			setMessages((prev) => [
				...prev,
				{
					id: Date.now(),
					content: `Sorry, I encountered an error: ${err.message}`,
					isUser: false,
					timestamp: new Date().toISOString(),
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleApplyPendingChanges = async () => {
		if (pendingChanges.length === 0) return;

		try {
			setIsLoading(true);
			await api.applyChatChanges(projectId, pendingChanges);
			onFilesChanged?.(pendingChanges);
			setPendingChanges([]);

			setMessages((prev) => [
				...prev,
				{
					id: Date.now(),
					content: `✅ Applied ${pendingChanges.length} file change(s) successfully!`,
					isUser: false,
					timestamp: new Date().toISOString(),
				},
			]);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClearHistory = async () => {
		try {
			await api.clearChatHistory(projectId);
			setMessages([]);
			setSuggestions([
				"Make the hero section more dynamic",
				"Add a profile photo",
				"Change the color scheme",
				"Add a new section",
			]);
		} catch (err) {
			console.error("Failed to clear history:", err);
		}
	};

	const handleRefreshContext = async () => {
		try {
			setIsLoading(true);
			await api.refreshChatContext(projectId);
			setMessages((prev) => [
				...prev,
				{
					id: Date.now(),
					content:
						"🔄 Context refreshed! I now have the latest version of all files.",
					isUser: false,
					timestamp: new Date().toISOString(),
				},
			]);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-y-0 right-0 w-[420px] bg-slate-900 border-l border-white/10 flex flex-col z-50 shadow-2xl">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
						<Sparkles className="w-4 h-4 text-white" />
					</div>
					<div>
						<h3 className="font-semibold text-white text-sm">AI Assistant</h3>
						<p className="text-xs text-gray-400">Supports text & images</p>
					</div>
				</div>

				<div className="flex items-center gap-1">
					<button
						onClick={handleRefreshContext}
						className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
						title="Refresh file context"
					>
						<RefreshCw className="w-4 h-4" />
					</button>
					<button
						onClick={handleClearHistory}
						className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
						title="Clear chat history"
					>
						<Trash2 className="w-4 h-4" />
					</button>
					<button
						onClick={onClose}
						className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* Preview Mode Toggle */}
			<div className="px-4 py-2 border-b border-white/10 bg-slate-800/50">
				<div className="flex items-center justify-between">
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={previewMode}
							onChange={(e) => setPreviewMode(e.target.checked)}
							className="sr-only"
						/>
						<div
							className={`w-9 h-5 rounded-full transition-colors ${
								previewMode ? "bg-purple-500" : "bg-gray-600"
							}`}
						>
							<div
								className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${
									previewMode ? "translate-x-4 ml-0.5" : "translate-x-0.5"
								}`}
							/>
						</div>
						<span className="text-xs text-gray-400">Preview before apply</span>
					</label>
					{previewMode && <Eye className="w-4 h-4 text-purple-400" />}
				</div>
			</div>

			{/* Pending Changes */}
			{pendingChanges.length > 0 && (
				<div className="px-4 py-3 bg-purple-500/10 border-b border-purple-500/20">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm text-purple-300 font-medium">
							{pendingChanges.length} pending change(s)
						</span>
						<button
							onClick={handleApplyPendingChanges}
							disabled={isLoading}
							className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 
                         text-white text-xs font-medium rounded-lg transition-colors"
						>
							<Play className="w-3 h-3" />
							Apply All
						</button>
					</div>
				</div>
			)}

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.length === 0 ? (
					<div className="text-center py-8">
						<div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
							<Bot className="w-8 h-8 text-purple-400" />
						</div>
						<h4 className="text-white font-medium mb-2">
							How can I help you today?
						</h4>
						<p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
							I can modify components, add images, change styles, and more.
						</p>

						<div className="flex flex-wrap justify-center gap-2">
							{suggestions.map((suggestion, idx) => (
								<SuggestionChip
									key={idx}
									text={suggestion}
									onClick={() => handleSend(suggestion)}
								/>
							))}
						</div>
					</div>
				) : (
					<>
						{messages.map((msg) => (
							<ChatMessage
								key={msg.id}
								message={msg.content}
								isUser={msg.isUser}
								filesChanged={msg.filesChanged}
								imagesAdded={msg.imagesAdded}
								timestamp={msg.timestamp}
							/>
						))}

						{isLoading && (
							<div className="flex gap-3">
								<div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
									<Bot className="w-4 h-4 text-purple-400" />
								</div>
								<div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-2xl rounded-tl-md">
									<Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
									<span className="text-sm text-gray-300">
										{selectedImages.length > 0
											? "Processing image..."
											: "Thinking..."}
									</span>
								</div>
							</div>
						)}

						{!isLoading && suggestions.length > 0 && (
							<div className="pt-4 border-t border-white/5">
								<p className="text-xs text-gray-500 mb-2">Suggestions:</p>
								<div className="flex flex-wrap gap-2">
									{suggestions.slice(0, 3).map((suggestion, idx) => (
										<SuggestionChip
											key={idx}
											text={suggestion}
											onClick={() => handleSend(suggestion)}
										/>
									))}
								</div>
							</div>
						)}
					</>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Error banner */}
			{error && (
				<div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
					<div className="flex items-center gap-2 text-sm text-red-400">
						<AlertCircle className="w-4 h-4 flex-shrink-0" />
						<span className="truncate">{error}</span>
						<button
							onClick={() => setError(null)}
							className="ml-auto p-1 hover:bg-red-500/20 rounded"
						>
							<X className="w-3 h-3" />
						</button>
					</div>
				</div>
			)}

			{/* Image Options Panel */}
			{showImageOptions && selectedImages.length > 0 && (
				<div className="px-4 py-3 bg-slate-800 border-t border-white/10">
					<div className="flex items-center gap-2 mb-3">
						{selectedImages.map((file, idx) => (
							<ImagePreview
								key={idx}
								file={file}
								onRemove={() => handleRemoveImage(idx)}
							/>
						))}
					</div>

					<div className="space-y-2">
						<div className="flex gap-2">
							<button
								onClick={() => setImagePurpose("add_to_project")}
								className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
									imagePurpose === "add_to_project"
										? "bg-purple-500 text-white"
										: "bg-white/5 text-gray-300 hover:bg-white/10"
								}`}
							>
								Add to Portfolio
							</button>
							<button
								onClick={() => setImagePurpose("analyze")}
								className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
									imagePurpose === "analyze"
										? "bg-purple-500 text-white"
										: "bg-white/5 text-gray-300 hover:bg-white/10"
								}`}
							>
								Just Analyze
							</button>
						</div>

						{imagePurpose === "add_to_project" && (
							<input
								type="text"
								value={imageTargetPath}
								onChange={(e) => setImageTargetPath(e.target.value)}
								placeholder="Path (e.g., /images/profile.jpg)"
								className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
							/>
						)}
					</div>
				</div>
			)}

			{/* Input */}
			<div className="p-4 border-t border-white/10 bg-slate-900/80 backdrop-blur-sm">
				<div className="flex gap-2">
					{/* Image Upload Button */}
					<button
						onClick={() => fileInputRef.current?.click()}
						disabled={isLoading}
						className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl 
                       text-gray-400 hover:text-white transition-colors disabled:opacity-50"
						title="Upload image"
					>
						<ImageIcon className="w-5 h-5" />
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						multiple
						onChange={handleImageSelect}
						className="hidden"
					/>

					<div className="flex-1 relative">
						<textarea
							ref={inputRef}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={
								selectedImages.length > 0
									? "Describe what to do with the image..."
									: "Ask me to modify your project..."
							}
							disabled={isLoading}
							rows={1}
							className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                         text-white placeholder-gray-500 text-sm resize-none
                         focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20
                         disabled:opacity-50 disabled:cursor-not-allowed
                         min-h-[44px] max-h-32"
							style={{height: "44px"}}
							onInput={(e) => {
								e.target.style.height = "44px";
								e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
							}}
						/>
					</div>

					<button
						onClick={() => handleSend()}
						disabled={
							(!inputValue.trim() && selectedImages.length === 0) || isLoading
						}
						className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 
                       hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 
                       disabled:cursor-not-allowed rounded-xl text-white font-medium
                       transition-all flex items-center justify-center"
					>
						{isLoading ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							<Send className="w-5 h-5" />
						)}
					</button>
				</div>
				<p className="text-xs text-gray-500 mt-2 text-center">
					Press Enter to send • Attach images with 📷
				</p>
			</div>
		</div>
	);
}
