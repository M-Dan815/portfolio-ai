import React, {useState} from "react";
import {
	Settings,
	X,
	Save,
	Loader2,
	AlertCircle,
	Package,
	Globe,
	Shield,
	Database,
	Trash2,
	Download,
	Upload,
} from "lucide-react";

export default function ProjectSettingsModal({
	isOpen,
	onClose,
	project,
	onUpdate,
	onDelete,
}) {
	const [activeTab, setActiveTab] = useState("general");
	const [formData, setFormData] = useState({
		name: project?.name || "",
		description: project?.description || "",
		project_type: project?.project_type || "react",
		theme: project?.theme || "modern",
		color_scheme: project?.color_scheme || "blue",
		visibility: project?.visibility || "private",
	});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	const handleSave = async () => {
		setSaving(true);
		setError(null);

		try {
			await onUpdate(formData);
			onClose();
		} catch (error) {
			setError(error.message);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (
			!confirm(
				"Are you sure you want to delete this project? This action cannot be undone.",
			)
		) {
			return;
		}

		if (
			prompt(`Type "${project.name}" to confirm deletion:`) !== project.name
		) {
			return;
		}

		await onDelete();
		onClose();
	};

	if (!isOpen) return null;

	const tabs = [
		{id: "general", label: "General", icon: Settings},
		{id: "build", label: "Build & Deploy", icon: Package},
		{id: "environment", label: "Environment", icon: Globe},
		{id: "advanced", label: "Advanced", icon: Shield},
	];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
					<div className="flex items-center gap-3">
						<Settings className="w-6 h-6 text-gray-400" />
						<h2 className="text-xl font-semibold text-white">
							Project Settings
						</h2>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-white/10 rounded-lg transition-colors"
					>
						<X className="w-5 h-5 text-gray-400" />
					</button>
				</div>

				{/* Tabs */}
				<div className="flex items-center gap-2 px-6 py-3 border-b border-white/10 overflow-x-auto">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
								activeTab === tab.id
									? "bg-blue-500/20 text-blue-400"
									: "text-gray-400 hover:text-white hover:bg-white/10"
							}`}
						>
							<tab.icon className="w-4 h-4" />
							{tab.label}
						</button>
					))}
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					{error && (
						<div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
							<div className="flex items-center gap-2">
								<AlertCircle className="w-5 h-5 text-red-400" />
								<p className="text-sm text-red-400">{error}</p>
							</div>
						</div>
					)}

					{activeTab === "general" && (
						<div className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Project Name
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData({...formData, name: e.target.value})
									}
									className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Description
								</label>
								<textarea
									value={formData.description}
									onChange={(e) =>
										setFormData({...formData, description: e.target.value})
									}
									rows={3}
									className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Project Type
									</label>
									<select
										value={formData.project_type}
										onChange={(e) =>
											setFormData({...formData, project_type: e.target.value})
										}
										className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
									>
										<option value="react">React</option>
										<option value="vue">Vue</option>
										<option value="angular">Angular</option>
										<option value="vanilla">Vanilla JS</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Visibility
									</label>
									<select
										value={formData.visibility}
										onChange={(e) =>
											setFormData({...formData, visibility: e.target.value})
										}
										className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
									>
										<option value="private">Private</option>
										<option value="public">Public</option>
									</select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Theme
									</label>
									<select
										value={formData.theme}
										onChange={(e) =>
											setFormData({...formData, theme: e.target.value})
										}
										className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
									>
										<option value="modern">Modern</option>
										<option value="minimal">Minimal</option>
										<option value="creative">Creative</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Color Scheme
									</label>
									<select
										value={formData.color_scheme}
										onChange={(e) =>
											setFormData({...formData, color_scheme: e.target.value})
										}
										className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
									>
										<option value="blue">Blue</option>
										<option value="purple">Purple</option>
										<option value="green">Green</option>
										<option value="orange">Orange</option>
										<option value="pink">Pink</option>
									</select>
								</div>
							</div>
						</div>
					)}

					{activeTab === "build" && (
						<div className="space-y-6">
							<div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
								<h3 className="font-semibold text-white mb-2">
									Build Configuration
								</h3>
								<p className="text-sm text-gray-400 mb-4">
									Configure build settings for production deployment
								</p>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Build Command
										</label>
										<input
											type="text"
											defaultValue="npm run build"
											className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Output Directory
										</label>
										<input
											type="text"
											defaultValue="dist"
											className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm"
										/>
									</div>
								</div>
							</div>

							<div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
								<h3 className="font-semibold text-white mb-2">
									Deploy Settings
								</h3>
								<p className="text-sm text-gray-400 mb-4">
									Choose your deployment platform
								</p>

								<div className="space-y-3">
									<label className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
										<input
											type="radio"
											name="deploy"
											defaultChecked
											className="text-blue-500"
										/>
										<div>
											<p className="text-white">Vercel</p>
											<p className="text-xs text-gray-400">
												Fast, global deployment
											</p>
										</div>
									</label>

									<label className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
										<input
											type="radio"
											name="deploy"
											className="text-blue-500"
										/>
										<div>
											<p className="text-white">Netlify</p>
											<p className="text-xs text-gray-400">
												Simple continuous deployment
											</p>
										</div>
									</label>
								</div>
							</div>
						</div>
					)}

					{activeTab === "environment" && (
						<div className="space-y-6">
							<div>
								<h3 className="font-semibold text-white mb-4">
									Environment Variables
								</h3>
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<input
											type="text"
											placeholder="KEY"
											className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-mono text-sm"
										/>
										<input
											type="text"
											placeholder="VALUE"
											className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-mono text-sm"
										/>
										<button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
											<X className="w-4 h-4 text-gray-400" />
										</button>
									</div>
								</div>
								<button className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">
									Add Variable
								</button>
							</div>

							<div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
								<p className="text-sm text-yellow-400">
									Environment variables are encrypted and only accessible during
									build time
								</p>
							</div>
						</div>
					)}

					{activeTab === "advanced" && (
						<div className="space-y-6">
							<div className="bg-white/5 rounded-xl p-6 space-y-4">
								<h3 className="font-semibold text-white">Export & Import</h3>

								<div className="flex items-center gap-3">
									<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
										<Download className="w-4 h-4" />
										Export Project
									</button>
									<button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
										<Upload className="w-4 h-4" />
										Import Settings
									</button>
								</div>
							</div>

							<div className="bg-white/5 rounded-xl p-6 space-y-4">
								<h3 className="font-semibold text-white">Database</h3>
								<button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
									<Database className="w-4 h-4" />
									Manage Database
								</button>
							</div>

							<div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 space-y-4">
								<h3 className="font-semibold text-red-400">Danger Zone</h3>
								<p className="text-sm text-gray-400">
									Once you delete a project, there is no going back. Please be
									certain.
								</p>
								<button
									onClick={handleDelete}
									className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
								>
									<Trash2 className="w-4 h-4" />
									Delete Project
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-white/10 bg-slate-900/50 flex items-center justify-end gap-3">
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						disabled={saving}
						className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
					>
						{saving ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Save className="w-4 h-4" />
						)}
						Save Changes
					</button>
				</div>
			</div>
		</div>
	);
}
