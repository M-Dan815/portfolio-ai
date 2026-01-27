import React, {useState, useEffect} from "react";
import {
	Clock,
	X,
	GitBranch,
	RotateCcw,
	Eye,
	Download,
	Loader2,
	CheckCircle,
	FileText,
	User,
	Calendar,
} from "lucide-react";
import api from "../../api";

export default function VersionHistoryModal({isOpen, onClose, projectId}) {
	const [versions, setVersions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedVersion, setSelectedVersion] = useState(null);
	const [restoring, setRestoring] = useState(false);
	const [comparing, setComparing] = useState(false);

	useEffect(() => {
		if (isOpen && projectId) {
			loadVersions();
		}
	}, [isOpen, projectId]);

	const loadVersions = async () => {
		setLoading(true);
		try {
			const versionList = await api.getVersions(projectId, 50);
			setVersions(versionList);
		} catch (error) {
			console.error("Failed to load versions:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleRestore = async (versionNumber) => {
		if (
			!confirm(
				"Are you sure you want to restore this version? Current changes will be saved as a new version.",
			)
		) {
			return;
		}

		setRestoring(true);
		try {
			await api.restoreVersion(projectId, versionNumber);
			onClose();
			// Refresh the editor
			window.location.reload();
		} catch (error) {
			console.error("Failed to restore version:", error);
			alert("Failed to restore version");
		} finally {
			setRestoring(false);
		}
	};

	const formatDate = (date) => {
		const d = new Date(date);
		const now = new Date();
		const diff = now - d;
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) {
			const hours = Math.floor(diff / (1000 * 60 * 60));
			if (hours === 0) {
				const minutes = Math.floor(diff / (1000 * 60));
				return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
			}
			return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
		} else if (days === 1) {
			return "Yesterday";
		} else if (days < 7) {
			return `${days} days ago`;
		} else {
			return d.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: days > 365 ? "numeric" : undefined,
			});
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
			<div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
							<GitBranch className="w-5 h-5 text-white" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-white">
								Version History
							</h2>
							<p className="text-sm text-gray-400">
								{versions.length} version{versions.length !== 1 ? "s" : ""}{" "}
								saved
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
				<div className="flex-1 overflow-y-auto">
					{loading ? (
						<div className="flex items-center justify-center py-20">
							<div className="text-center">
								<Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
								<p className="text-gray-400">Loading version history...</p>
							</div>
						</div>
					) : versions.length === 0 ? (
						<div className="text-center py-20">
							<Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
							<p className="text-gray-400">No versions yet</p>
						</div>
					) : (
						<div className="divide-y divide-white/10">
							{versions.map((version, index) => (
								<div
									key={version.version_number}
									className={`group hover:bg-white/5 transition-colors ${
										selectedVersion?.version_number === version.version_number
											? "bg-blue-500/10"
											: ""
									}`}
								>
									<div className="p-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-3 mb-2">
													<div
														className={`px-2 py-1 rounded-full text-xs font-medium ${
															index === 0
																? "bg-green-500/20 text-green-400"
																: "bg-gray-500/20 text-gray-400"
														}`}
													>
														v{version.version_number}
													</div>
													{index === 0 && (
														<span className="text-xs text-green-400">
															Current
														</span>
													)}
													<span className="text-xs text-gray-500">
														{formatDate(version.created_at)}
													</span>
												</div>

												<p className="text-white font-medium mb-1">
													{version.message ||
														`Version ${version.version_number}`}
												</p>

												{version.description && (
													<p className="text-sm text-gray-400 mb-3">
														{version.description}
													</p>
												)}

												<div className="flex items-center gap-4 text-xs text-gray-500">
													<span className="flex items-center gap-1">
														<User className="w-3 h-3" />
														{version.created_by || "You"}
													</span>
													<span className="flex items-center gap-1">
														<Calendar className="w-3 h-3" />
														{new Date(version.created_at).toLocaleDateString()}
													</span>
													<span className="flex items-center gap-1">
														<FileText className="w-3 h-3" />
														{version.file_count || 0} files
													</span>
												</div>

												{/* File changes */}
												{version.changes && version.changes.length > 0 && (
													<div className="mt-3 space-y-1">
														<p className="text-xs text-gray-500">Changes:</p>
														<div className="flex flex-wrap gap-2">
															{version.changes.slice(0, 5).map((change, i) => (
																<span
																	key={i}
																	className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400"
																>
																	{change.type === "added" && "+ "}
																	{change.type === "modified" && "~ "}
																	{change.type === "deleted" && "- "}
																	{change.file}
																</span>
															))}
															{version.changes.length > 5 && (
																<span className="px-2 py-1 text-xs text-gray-500">
																	+{version.changes.length - 5} more
																</span>
															)}
														</div>
													</div>
												)}
											</div>

											{/* Actions */}
											<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
												<button
													onClick={() => setSelectedVersion(version)}
													className="p-2 hover:bg-white/10 rounded-lg transition-colors"
													title="Preview"
												>
													<Eye className="w-4 h-4 text-gray-400" />
												</button>

												{index !== 0 && (
													<button
														onClick={() =>
															handleRestore(version.version_number)
														}
														disabled={restoring}
														className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
														title="Restore this version"
													>
														{restoring ? (
															<Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
														) : (
															<RotateCcw className="w-4 h-4 text-gray-400" />
														)}
													</button>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-white/10 bg-slate-900/50">
					<div className="flex items-center justify-between">
						<p className="text-xs text-gray-500">
							Versions are automatically created when you save significant
							changes
						</p>
						<button
							onClick={onClose}
							className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
