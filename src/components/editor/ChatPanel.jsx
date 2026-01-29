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
	ChevronDown,
	CheckCircle,
	AlertCircle,
	Eye,
	Play,
} from "lucide-react";
import api from "../../api";

function ChatMessage({message, isUser, filesChanged, timestamp}) {
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
								className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-lg"
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
		"Change the color scheme to green",
		"Add a testimonials section",
	]);
	const [error, setError] = useState(null);
	const [previewMode, setPreviewMode] = useState(false);
	const [pendingChanges, setPendingChanges] = useState([]);

	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);

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
					timestamp: msg.timestamp,
				}));
				setMessages(formattedMessages);
			}
		} catch (err) {
			console.error("Failed to load chat history:", err);
		}
	};

	const handleSend = async (messageText = inputValue) => {
		if (!messageText.trim() || isLoading) return;

		const userMessage = {
			id: Date.now(),
			content: messageText.trim(),
			isUser: true,
			timestamp: new Date().toISOString(),
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
				},
			);

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
					timestamp: new Date().toISOString(),
				};

				setMessages((prev) => [...prev, aiMessage]);

				// Update suggestions
				if (response.suggestions && response.suggestions.length > 0) {
					setSuggestions(response.suggestions);
				}

				// Notify parent about file changes
				if (response.files_changed && response.files_changed.length > 0) {
					if (previewMode) {
						setPendingChanges(response.files_changed);
					} else {
						onFilesChanged?.(response.files_changed);
					}
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
				"Add animations to the skill cards",
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
		<div className="fixed inset-y-0 right-0 w-[400px] bg-slate-900 border-l border-white/10 flex flex-col z-50 shadow-2xl">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
						<Sparkles className="w-4 h-4 text-white" />
					</div>
					<div>
						<h3 className="font-semibold text-white text-sm">AI Assistant</h3>
						<p className="text-xs text-gray-400">
							Ask me to modify your project
						</p>
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
					<div className="space-y-1 max-h-24 overflow-y-auto">
						{pendingChanges.map((change, idx) => (
							<div
								key={idx}
								className="text-xs text-purple-300/80 flex items-center gap-1.5"
							>
								<FileCode className="w-3 h-3" />
								<span>{change.path}</span>
								<span className="text-purple-400/60">({change.action})</span>
							</div>
						))}
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
							I can modify your components, add new features, change styles, and
							more.
						</p>

						{/* Suggestion chips */}
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
								timestamp={msg.timestamp}
							/>
						))}

						{/* Loading indicator */}
						{isLoading && (
							<div className="flex gap-3">
								<div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
									<Bot className="w-4 h-4 text-purple-400" />
								</div>
								<div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-2xl rounded-tl-md">
									<Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
									<span className="text-sm text-gray-300">Thinking...</span>
								</div>
							</div>
						)}

						{/* Suggestions after messages */}
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

			{/* Input */}
			<div className="p-4 border-t border-white/10 bg-slate-900/80 backdrop-blur-sm">
				<div className="flex gap-2">
					<div className="flex-1 relative">
						<textarea
							ref={inputRef}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Ask me to modify your project..."
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
						disabled={!inputValue.trim() || isLoading}
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
					Press Enter to send, Shift+Enter for new line
				</p>
			</div>
		</div>
	);
}
