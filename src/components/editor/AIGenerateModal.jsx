import React, {useState} from "react";
import {X, Sparkles, Loader2, Code, AlertCircle} from "lucide-react";

export default function AIGenerateModal({
	isOpen,
	onClose,
	onGenerate,
	generating,
}) {
	const [description, setDescription] = useState("");
	const [componentName, setComponentName] = useState("");
	const [targetPath, setTargetPath] = useState("src/components/");
	const [error, setError] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		if (!description.trim()) {
			setError("Please provide a component description");
			return;
		}

		try {
			await onGenerate({
				description: description.trim(),
				componentName: componentName.trim() || null,
				targetPath: targetPath.trim() || null,
			});
			// Reset form
			setDescription("");
			setComponentName("");
			setTargetPath("src/components/");
			onClose();
		} catch (err) {
			setError(err.message);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
							<Sparkles className="w-5 h-5 text-white" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-white">
								AI Component Generator
							</h2>
							<p className="text-sm text-gray-400">
								Describe what you want to create
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
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Error Display */}
					{error && (
						<div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
							<AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
							<p className="text-sm text-red-400">{error}</p>
						</div>
					)}

					{/* Description */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Component Description <span className="text-red-400">*</span>
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Create a responsive navigation bar with logo, menu items, and a mobile hamburger menu. Include smooth animations and a dark theme."
							rows={5}
							className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
							disabled={generating}
						/>
						<p className="mt-2 text-xs text-gray-500">
							Be specific about functionality, styling, and any special
							requirements.
						</p>
					</div>

					{/* Component Name */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Component Name (optional)
						</label>
						<input
							type="text"
							value={componentName}
							onChange={(e) => setComponentName(e.target.value)}
							placeholder="NavigationBar"
							className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
							disabled={generating}
						/>
						<p className="mt-2 text-xs text-gray-500">
							If not provided, AI will generate an appropriate name.
						</p>
					</div>

					{/* Target Path */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Target Path (optional)
						</label>
						<input
							type="text"
							value={targetPath}
							onChange={(e) => setTargetPath(e.target.value)}
							placeholder="src/components/"
							className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
							disabled={generating}
						/>
						<p className="mt-2 text-xs text-gray-500">
							Where to create the component file.
						</p>
					</div>

					{/* Tips */}
					<div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
						<h4 className="text-sm font-medium text-blue-400 mb-2">
							💡 Tips for better results:
						</h4>
						<ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
							<li>
								Describe the component's purpose and functionality clearly
							</li>
							<li>
								Specify styling preferences (colors, layout, responsive
								behavior)
							</li>
							<li>Mention any props or state the component should handle</li>
							<li>Include examples of similar components if helpful</li>
						</ul>
					</div>

					{/* Actions */}
					<div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
							disabled={generating}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={generating || !description.trim()}
							className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{generating ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									Generating...
								</>
							) : (
								<>
									<Sparkles className="w-4 h-4" />
									Generate Component
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
