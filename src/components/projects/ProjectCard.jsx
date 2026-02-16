import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
	Code,
	Eye,
	Download,
	Trash2,
	Calendar,
	FileCode,
	Loader2,
	ExternalLink,
	Hammer,
	CheckCircle,
	AlertCircle,
	Clock,
} from "lucide-react";
import api from "../../api";

// ==================== Delete Confirmation Modal ====================

function DeleteConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	projectName,
	deleting,
}) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
				<div className="flex items-center gap-4 mb-4">
					<div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
						<Trash2 className="w-6 h-6 text-red-400" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-white">Delete Project</h3>
						<p className="text-sm text-gray-400">
							This action cannot be undone
						</p>
					</div>
				</div>

				<p className="text-gray-300 mb-6">
					Are you sure you want to delete{" "}
					<span className="font-semibold text-white">"{projectName}"</span>? All
					files and deployment data will be permanently removed.
				</p>

				<div className="flex gap-3">
					<button
						onClick={onClose}
						disabled={deleting}
						className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl 
						           text-white font-medium transition-colors disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						disabled={deleting}
						className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
						           bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium 
						           transition-colors disabled:opacity-50"
					>
						{deleting ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								Deleting...
							</>
						) : (
							<>
								<Trash2 className="w-4 h-4" />
								Delete
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}

// ==================== Project Card ====================

export default function ProjectCard({project, onDelete}) {
	const navigate = useNavigate();
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const [building, setBuilding] = useState(false);

	const handleOpenEditor = () => {
		navigate(`/editor/${project.project_id}`);
	};

	const handlePreview = () => {
		const previewUrl = api.getPreviewUrl(project.project_id);
		window.open(previewUrl, "_blank");
	};

	const handleDownload = async () => {
		setDownloading(true);
		try {
			await api.downloadProject(project.project_id);
		} catch (error) {
			console.error("Download failed:", error);
			alert("Failed to download project");
		} finally {
			setDownloading(false);
		}
	};

	const handleDelete = async () => {
		setDeleting(true);
		try {
			await api.deleteProject(project.project_id);
			if (onDelete) {
				onDelete(project.project_id);
			}
			setShowDeleteModal(false);
		} catch (error) {
			console.error("Delete failed:", error);
			alert("Failed to delete project");
		} finally {
			setDeleting(false);
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getStatusInfo = () => {
		const statusMap = {
			generating: {
				icon: Loader2,
				color: "text-blue-400",
				bg: "bg-blue-500/20",
				label: "Generating",
				animate: true,
			},
			ready: {
				icon: CheckCircle,
				color: "text-green-400",
				bg: "bg-green-500/20",
				label: "Ready",
			},
			built: {
				icon: CheckCircle,
				color: "text-green-400",
				bg: "bg-green-500/20",
				label: "Built",
			},
			deployed: {
				icon: ExternalLink,
				color: "text-purple-400",
				bg: "bg-purple-500/20",
				label: "Deployed",
			},
			error: {
				icon: AlertCircle,
				color: "text-red-400",
				bg: "bg-red-500/20",
				label: "Error",
			},
		};
		return (
			statusMap[project.status] || {
				icon: Clock,
				color: "text-gray-400",
				bg: "bg-gray-500/20",
				label: project.status,
			}
		);
	};

	const statusInfo = getStatusInfo();
	const StatusIcon = statusInfo.icon;

	return (
		<>
			<div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
				{/* Preview Area */}
				<div
					className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 relative cursor-pointer"
					onClick={handleOpenEditor}
				>
					{/* Status Badge */}
					<div className="absolute top-3 left-3">
						<div
							className={`flex items-center gap-1.5 px-2.5 py-1 ${statusInfo.bg} rounded-full`}
						>
							<StatusIcon
								className={`w-3.5 h-3.5 ${statusInfo.color} ${statusInfo.animate ? "animate-spin" : ""}`}
							/>
							<span className={`text-xs font-medium ${statusInfo.color}`}>
								{statusInfo.label}
							</span>
						</div>
					</div>

					{/* Centered Icon */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center opacity-50 group-hover:opacity-70 transition-opacity">
							<Code className="w-8 h-8 text-white" />
						</div>
					</div>

					{/* Hover Overlay */}
					<div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
						<span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white font-medium">
							Open Editor
						</span>
					</div>
				</div>

				{/* Content */}
				<div className="p-5">
					<h3
						className="font-semibold text-white mb-1 truncate cursor-pointer hover:text-blue-400 transition-colors"
						onClick={handleOpenEditor}
					>
						{project.name}
					</h3>

					{project.description && (
						<p className="text-sm text-gray-400 mb-3 line-clamp-2">
							{project.description}
						</p>
					)}

					<div className="flex items-center justify-between text-xs text-gray-500 mb-4">
						<div className="flex items-center gap-1">
							<Calendar className="w-3.5 h-3.5" />
							<span>{formatDate(project.created_at)}</span>
						</div>
						<div className="flex items-center gap-1">
							<FileCode className="w-3.5 h-3.5" />
							<span>{project.file_count || 0} files</span>
						</div>
					</div>

					{/* Primary Actions */}
					<div className="flex items-center gap-2 mb-3">
						<button
							onClick={handleOpenEditor}
							className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-sm font-medium text-white transition-all"
						>
							<Code className="w-4 h-4" />
							Edit
						</button>
						<button
							onClick={handlePreview}
							className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white transition-all"
							title="Preview"
						>
							<Eye className="w-4 h-4" />
						</button>
					</div>

					{/* Secondary Actions */}
					<div className="flex items-center gap-2">
						<button
							onClick={handleDownload}
							disabled={downloading}
							className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-all disabled:opacity-50"
							title="Download Project"
						>
							{downloading ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<Download className="w-4 h-4" />
							)}
							<span className="hidden sm:inline">Download</span>
						</button>

						<button
							onClick={() => setShowDeleteModal(true)}
							className="flex items-center justify-center px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all"
							title="Delete Project"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDelete}
				projectName={project.name}
				deleting={deleting}
			/>
		</>
	);
}
