import React, {useState, useRef, useEffect} from "react";
import {
	X,
	Upload,
	FileText,
	MessageSquare,
	FolderPlus,
	Loader2,
	ChevronRight,
	Sparkles,
	AlertCircle,
	Palette,
	Layout,
	Wand2,
	Check,
	Info,
} from "lucide-react";
import {useProject} from "../../context/ProjectContext";
import {useNavigate} from "react-router-dom";
import api from "../../api";

// Fallback design options (used if API fails)
const FALLBACK_THEMES = [
	{
		id: "modern",
		name: "Modern",
		description: "Clean, minimalist, lots of whitespace, refined",
	},
	{
		id: "creative",
		name: "Creative",
		description: "Bold, artistic, unique layouts, expressive",
	},
	{
		id: "minimal",
		name: "Minimal",
		description: "Ultra-minimal, focus on content, zen-like",
	},
	{
		id: "professional",
		name: "Professional",
		description: "Corporate, trustworthy, structured, polished",
	},
	{
		id: "bold",
		name: "Bold",
		description: "High contrast, impactful, statement-making",
	},
	{
		id: "futuristic",
		name: "Futuristic",
		description: "Sci-fi, tech-forward, cyberpunk influences",
	},
	{
		id: "elegant",
		name: "Elegant",
		description: "Luxurious, sophisticated, refined taste",
	},
];

const FALLBACK_COLORS = [
	{
		id: "blue",
		name: "Blue",
		primary: "blue",
		gradient_from: "blue-600",
		gradient_to: "indigo-600",
	},
	{
		id: "green",
		name: "Green",
		primary: "emerald",
		gradient_from: "emerald-600",
		gradient_to: "teal-600",
	},
	{
		id: "purple",
		name: "Purple",
		primary: "purple",
		gradient_from: "purple-600",
		gradient_to: "violet-600",
	},
	{
		id: "red",
		name: "Red",
		primary: "red",
		gradient_from: "red-600",
		gradient_to: "rose-600",
	},
	{
		id: "orange",
		name: "Orange",
		primary: "orange",
		gradient_from: "orange-600",
		gradient_to: "amber-600",
	},
	{
		id: "cyan",
		name: "Cyan",
		primary: "cyan",
		gradient_from: "cyan-600",
		gradient_to: "sky-600",
	},
	{
		id: "pink",
		name: "Pink",
		primary: "pink",
		gradient_from: "pink-600",
		gradient_to: "rose-600",
	},
	{
		id: "yellow",
		name: "Yellow",
		primary: "yellow",
		gradient_from: "yellow-500",
		gradient_to: "amber-500",
	},
];

// Color classes for visual swatches
const COLOR_CLASSES = {
	blue: "from-blue-600 to-indigo-600",
	green: "from-emerald-600 to-teal-600",
	purple: "from-purple-600 to-violet-600",
	red: "from-red-600 to-rose-600",
	orange: "from-orange-600 to-amber-600",
	cyan: "from-cyan-600 to-sky-600",
	pink: "from-pink-600 to-rose-600",
	yellow: "from-yellow-500 to-amber-500",
};

// Theme icons/emojis for visual appeal
const THEME_ICONS = {
	modern: "✨",
	creative: "🎨",
	minimal: "◯",
	professional: "💼",
	bold: "⚡",
	futuristic: "🚀",
	elegant: "💎",
};

export default function CreateProjectModal({isOpen, onClose}) {
	const navigate = useNavigate();
	const {
		generateFromCV,
		generateFromPrompt,
		createProject,
		isGenerating,
		generationStatus,
	} = useProject();

	const [step, setStep] = useState("choose"); // choose, cv, prompt, empty
	const [file, setFile] = useState(null);
	const [prompt, setPrompt] = useState("");
	const [projectName, setProjectName] = useState("");
	const [theme, setTheme] = useState("modern");
	const [colorScheme, setColorScheme] = useState("blue");
	const [error, setError] = useState(null);
	const [creating, setCreating] = useState(false);
	const [showAdvanced, setShowAdvanced] = useState(false);

	// Design options from API
	const [designOptions, setDesignOptions] = useState(null);
	const [loadingOptions, setLoadingOptions] = useState(false);

	const fileInputRef = useRef(null);

	// Fetch design options when modal opens
	useEffect(() => {
		if (isOpen && !designOptions) {
			fetchDesignOptions();
		}
	}, [isOpen]);

	const fetchDesignOptions = async () => {
		setLoadingOptions(true);
		try {
			const options = await api.getDesignOptions();
			setDesignOptions(options);
		} catch (err) {
			console.error("Failed to fetch design options:", err);
			// Use fallback options
			setDesignOptions({
				themes: FALLBACK_THEMES,
				color_schemes: FALLBACK_COLORS,
			});
		} finally {
			setLoadingOptions(false);
		}
	};

	const themes = designOptions?.themes || FALLBACK_THEMES;
	const colors = designOptions?.color_schemes || FALLBACK_COLORS;

	const handleFileSelect = (e) => {
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			// Validate file type
			const validTypes = [".pdf", ".docx", ".doc", ".txt"];
			const ext = selectedFile.name
				.toLowerCase()
				.slice(selectedFile.name.lastIndexOf("."));

			if (!validTypes.includes(ext)) {
				setError("Please upload a PDF, DOCX, or TXT file");
				return;
			}

			if (selectedFile.size > 10 * 1024 * 1024) {
				setError("File size must be less than 10MB");
				return;
			}

			setFile(selectedFile);
			setError(null);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		const droppedFile = e.dataTransfer.files[0];
		if (droppedFile) {
			const input = fileInputRef.current;
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(droppedFile);
			input.files = dataTransfer.files;
			handleFileSelect({target: input});
		}
	};

	const handleGenerateFromCV = async () => {
		if (!file) {
			setError("Please select a file");
			return;
		}

		setCreating(true);
		setError(null);

		try {
			const project = await generateFromCV(file, {
				name: projectName || undefined,
				theme,
				color_scheme: colorScheme,
			});

			navigate(`/editor/${project.project_id}`);
			onClose();
		} catch (err) {
			setError(err.message);
		} finally {
			setCreating(false);
		}
	};

	const handleGenerateFromPrompt = async () => {
		if (!prompt.trim()) {
			setError("Please enter a description");
			return;
		}

		if (prompt.trim().length < 20) {
			setError("Please provide more details (at least 20 characters)");
			return;
		}

		setCreating(true);
		setError(null);

		try {
			const project = await generateFromPrompt(prompt, {
				name: projectName || undefined,
				theme,
				color_scheme: colorScheme,
			});

			navigate(`/editor/${project.project_id}`);
			onClose();
		} catch (err) {
			setError(err.message);
		} finally {
			setCreating(false);
		}
	};

	const handleCreateEmpty = async () => {
		if (!projectName.trim()) {
			setError("Please enter a project name");
			return;
		}

		setCreating(true);
		setError(null);

		try {
			const project = await createProject({
				name: projectName,
				project_type: "react",
				theme,
				color_scheme: colorScheme,
			});

			navigate(`/editor/${project.project_id}`);
			onClose();
		} catch (err) {
			setError(err.message);
		} finally {
			setCreating(false);
		}
	};

	const resetModal = () => {
		setStep("choose");
		setFile(null);
		setPrompt("");
		setProjectName("");
		setTheme("modern");
		setColorScheme("blue");
		setError(null);
		setCreating(false);
		setShowAdvanced(false);
	};

	const handleClose = () => {
		resetModal();
		onClose();
	};

	if (!isOpen) return null;

	// Get current theme and color info
	const currentTheme = themes.find((t) => t.id === theme) || themes[0];
	const currentColor = colors.find((c) => c.id === colorScheme) || colors[0];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				onClick={handleClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
					<div className="flex items-center gap-3">
						{step !== "choose" && (
							<button
								onClick={() => setStep("choose")}
								className="p-1 hover:bg-white/10 rounded-lg transition-colors"
							>
								<ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
							</button>
						)}
						<h2 className="text-xl font-semibold text-white">
							{step === "choose" && "Create New Project"}
							{step === "cv" && "Generate from CV"}
							{step === "prompt" && "Generate from Description"}
							{step === "empty" && "Create Empty Project"}
						</h2>
					</div>
					<button
						onClick={handleClose}
						className="p-2 hover:bg-white/10 rounded-lg transition-colors"
					>
						<X className="w-5 h-5 text-gray-400" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
					{/* Error Display */}
					{error && (
						<div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-xl mb-6">
							<AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
							<p className="text-sm text-red-400">{error}</p>
						</div>
					)}

					{/* Step: Choose */}
					{step === "choose" && (
						<div className="grid gap-4">
							<button
								onClick={() => setStep("cv")}
								className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-all text-left group"
							>
								<div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
									<Upload className="w-6 h-6 text-blue-400" />
								</div>
								<div>
									<h3 className="font-semibold text-white mb-1 flex items-center gap-2">
										Upload CV/Resume
										<span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
											Recommended
										</span>
									</h3>
									<p className="text-sm text-gray-400">
										Upload your CV or resume and AI will generate a complete
										portfolio website with all your information.
									</p>
								</div>
							</button>

							<button
								onClick={() => setStep("prompt")}
								className="flex items-start gap-4 p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-all text-left group"
							>
								<div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
									<MessageSquare className="w-6 h-6 text-purple-400" />
								</div>
								<div>
									<h3 className="font-semibold text-white mb-1">
										Describe Yourself
									</h3>
									<p className="text-sm text-gray-400">
										Tell us about yourself, your skills, and experience. AI will
										create a personalized portfolio.
									</p>
								</div>
							</button>

							<button
								onClick={() => setStep("empty")}
								className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 rounded-xl hover:border-white/30 transition-all text-left group"
							>
								<div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
									<FolderPlus className="w-6 h-6 text-gray-400" />
								</div>
								<div>
									<h3 className="font-semibold text-white mb-1">
										Start from Scratch
									</h3>
									<p className="text-sm text-gray-400">
										Create an empty React project and build your portfolio
										manually.
									</p>
								</div>
							</button>
						</div>
					)}

					{/* Step: CV Upload */}
					{step === "cv" && (
						<div className="space-y-6">
							{/* File Drop Zone */}
							<div
								onDragOver={(e) => e.preventDefault()}
								onDrop={handleDrop}
								className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
									file
										? "border-green-500/50 bg-green-500/10"
										: "border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5"
								}`}
								onClick={() => fileInputRef.current?.click()}
							>
								<input
									ref={fileInputRef}
									type="file"
									accept=".pdf,.docx,.doc,.txt"
									onChange={handleFileSelect}
									className="hidden"
								/>

								{file ? (
									<div className="flex items-center justify-center gap-3">
										<FileText className="w-10 h-10 text-green-400" />
										<div className="text-left">
											<p className="font-medium text-white">{file.name}</p>
											<p className="text-sm text-gray-400">
												{(file.size / 1024).toFixed(1)} KB
											</p>
										</div>
										<button
											onClick={(e) => {
												e.stopPropagation();
												setFile(null);
											}}
											className="p-1 hover:bg-white/10 rounded-lg"
										>
											<X className="w-5 h-5 text-gray-400" />
										</button>
									</div>
								) : (
									<>
										<Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
										<p className="text-white mb-2">
											Drop your CV here or click to browse
										</p>
										<p className="text-sm text-gray-500">
											PDF, DOCX, or TXT (max 10MB)
										</p>
									</>
								)}
							</div>

							{/* Project Name */}
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Project Name (optional)
								</label>
								<input
									type="text"
									value={projectName}
									onChange={(e) => setProjectName(e.target.value)}
									placeholder="My Portfolio"
									className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
								/>
							</div>

							{/* Design Options Toggle */}
							<div>
								<button
									type="button"
									onClick={() => setShowAdvanced(!showAdvanced)}
									className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
								>
									<Palette className="w-4 h-4" />
									<span>Customize Design</span>
									<ChevronRight
										className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-90" : ""}`}
									/>
								</button>
							</div>

							{/* Design Options (Expanded) */}
							{showAdvanced && (
								<DesignOptions
									themes={themes}
									colors={colors}
									selectedTheme={theme}
									selectedColor={colorScheme}
									onThemeChange={setTheme}
									onColorChange={setColorScheme}
									loading={loadingOptions}
								/>
							)}

							{/* Quick Preview of Selected Options */}
							{!showAdvanced && (
								<div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
									<div className="flex items-center gap-2">
										<span className="text-gray-400 text-sm">Theme:</span>
										<span className="text-white text-sm font-medium">
											{THEME_ICONS[theme] || "✨"} {currentTheme?.name || theme}
										</span>
									</div>
									<div className="w-px h-4 bg-white/20" />
									<div className="flex items-center gap-2">
										<span className="text-gray-400 text-sm">Color:</span>
										<div
											className={`w-4 h-4 rounded-full bg-gradient-to-r ${COLOR_CLASSES[colorScheme] || COLOR_CLASSES.blue}`}
										/>
										<span className="text-white text-sm font-medium capitalize">
											{colorScheme}
										</span>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Step: Prompt */}
					{step === "prompt" && (
						<div className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Tell us about yourself
								</label>
								<textarea
									value={prompt}
									onChange={(e) => setPrompt(e.target.value)}
									placeholder="I'm a software developer with 5 years of experience. I specialize in React, Node.js, and Python. I've worked at several startups and built products used by thousands of users. My skills include..."
									rows={6}
									className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
								/>
								<p className="mt-2 text-xs text-gray-500">
									Include your name, profession, skills, experience, and any
									projects you've worked on.
								</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Project Name (optional)
								</label>
								<input
									type="text"
									value={projectName}
									onChange={(e) => setProjectName(e.target.value)}
									placeholder="My Portfolio"
									className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
								/>
							</div>

							{/* Full Design Options for Prompt */}
							<DesignOptions
								themes={themes}
								colors={colors}
								selectedTheme={theme}
								selectedColor={colorScheme}
								onThemeChange={setTheme}
								onColorChange={setColorScheme}
								loading={loadingOptions}
							/>
						</div>
					)}

					{/* Step: Empty */}
					{step === "empty" && (
						<div className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Project Name <span className="text-red-400">*</span>
								</label>
								<input
									type="text"
									value={projectName}
									onChange={(e) => setProjectName(e.target.value)}
									placeholder="My Portfolio"
									className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
								/>
							</div>

							<div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
								<p className="text-sm text-yellow-400">
									This will create an empty React project with basic
									configuration. You'll need to add components and content
									manually.
								</p>
							</div>
						</div>
					)}

					{/* Generation Progress */}
					{isGenerating && generationStatus && (
						<div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
							<div className="flex items-center gap-3 mb-3">
								<Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
								<span className="text-blue-400 font-medium">
									{generationStatus.current_step || "Generating..."}
								</span>
							</div>
							<div className="h-2 bg-white/10 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
									style={{width: `${generationStatus.progress || 0}%`}}
								/>
							</div>
							<p className="text-xs text-gray-400 mt-2">
								{generationStatus.progress || 0}% complete
							</p>
						</div>
					)}
				</div>

				{/* Footer */}
				{step !== "choose" && (
					<div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-gray-400">
							<Wand2 className="w-4 h-4" />
							<span>
								AI will create a unique{" "}
								{currentTheme?.name?.toLowerCase() || "modern"} design
							</span>
						</div>
						<div className="flex items-center gap-3">
							<button
								onClick={() => setStep("choose")}
								className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
								disabled={creating || isGenerating}
							>
								Back
							</button>
							<button
								onClick={() => {
									if (step === "cv") handleGenerateFromCV();
									else if (step === "prompt") handleGenerateFromPrompt();
									else if (step === "empty") handleCreateEmpty();
								}}
								disabled={creating || isGenerating}
								className={`flex items-center gap-2 px-6 py-2 bg-gradient-to-r ${COLOR_CLASSES[colorScheme] || COLOR_CLASSES.blue} hover:opacity-90 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
							>
								{creating || isGenerating ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										{step === "empty" ? "Creating..." : "Generating..."}
									</>
								) : (
									<>
										<Sparkles className="w-4 h-4" />
										{step === "empty" ? "Create Project" : "Generate Portfolio"}
									</>
								)}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// Separate component for Design Options
function DesignOptions({
	themes,
	colors,
	selectedTheme,
	selectedColor,
	onThemeChange,
	onColorChange,
	loading,
}) {
	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Theme Selection */}
			<div>
				<label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
					<Layout className="w-4 h-4" />
					Design Theme
				</label>
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
					{themes.map((t) => (
						<button
							key={t.id}
							type="button"
							onClick={() => onThemeChange(t.id)}
							className={`relative p-3 rounded-xl border text-left transition-all group ${
								selectedTheme === t.id
									? "border-blue-500 bg-blue-500/20 ring-1 ring-blue-500/50"
									: "border-white/10 hover:border-white/30 hover:bg-white/5"
							}`}
						>
							{selectedTheme === t.id && (
								<div className="absolute top-2 right-2">
									<Check className="w-4 h-4 text-blue-400" />
								</div>
							)}
							<div className="text-lg mb-1">{THEME_ICONS[t.id] || "✨"}</div>
							<p className="font-medium text-white text-sm">{t.name}</p>
							<p className="text-xs text-gray-400 line-clamp-2 mt-1">
								{t.description}
							</p>
						</button>
					))}
				</div>
			</div>

			{/* Color Scheme Selection */}
			<div>
				<label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
					<Palette className="w-4 h-4" />
					Color Scheme
				</label>
				<div className="flex flex-wrap gap-3">
					{colors.map((c) => (
						<button
							key={c.id}
							type="button"
							onClick={() => onColorChange(c.id)}
							className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
								selectedColor === c.id
									? "border-white/50 bg-white/10"
									: "border-white/10 hover:border-white/30"
							}`}
						>
							<div
								className={`w-6 h-6 rounded-full bg-gradient-to-r ${COLOR_CLASSES[c.id] || COLOR_CLASSES.blue} ${
									selectedColor === c.id
										? "ring-2 ring-white ring-offset-2 ring-offset-slate-900"
										: ""
								}`}
							/>
							<span
								className={`text-sm ${selectedColor === c.id ? "text-white font-medium" : "text-gray-400"}`}
							>
								{c.name}
							</span>
							{selectedColor === c.id && (
								<Check className="w-4 h-4 text-white" />
							)}
						</button>
					))}
				</div>
			</div>

			{/* Design Info */}
			<div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
				<Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
				<div className="text-sm">
					<p className="text-blue-300 font-medium mb-1">AI-Powered Design</p>
					<p className="text-gray-400">
						Each portfolio gets a unique design personality with custom
						animations, layouts, and visual effects based on your content. No
						two portfolios look the same!
					</p>
				</div>
			</div>
		</div>
	);
}
