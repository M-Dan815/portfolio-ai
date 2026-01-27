import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
	Code,
	Eye,
	Download,
	Trash2,
	MoreVertical,
	Calendar,
	FileCode,
	Loader2,
	ExternalLink,
	Hammer,
	CheckCircle,
	AlertCircle,
	Clock,
} from "lucide-react";
import {useProject} from "../../context/ProjectContext";
import api from "../../api";

export default function ProjectCard({project, onDelete}) {
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);
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
			setMenuOpen(false);
		}
	};

	const handleBuild = async () => {
		setBuilding(true);
		try {
			await api.buildProject(project.project_id);
			// Could show a toast here
		} catch (error) {
			console.error("Build failed:", error);
			alert("Failed to start build");
		} finally {
			setBuilding(false);
			setMenuOpen(false);
		}
	};

	const handleDelete = async () => {
		if (
			!confirm(
				"Are you sure you want to delete this project? This cannot be undone.",
			)
		) {
			return;
		}

		setDeleting(true);
		try {
			await api.deleteProject(project.project_id);
			if (onDelete) {
				onDelete(project.project_id);
			}
		} catch (error) {
			console.error("Delete failed:", error);
			alert("Failed to delete project");
		} finally {
			setDeleting(false);
			setMenuOpen(false);
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
			building: {
				icon: Hammer,
				color: "text-yellow-400",
				bg: "bg-yellow-500/20",
				label: "Building",
				animate: true,
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

				{/* Menu Button */}
				<div className="absolute top-3 right-3">
					<div className="relative">
						<button
							onClick={(e) => {
								e.stopPropagation();
								setMenuOpen(!menuOpen);
							}}
							className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
						>
							<MoreVertical className="w-4 h-4 text-white" />
						</button>

						{menuOpen && (
							<>
								<div
									className="fixed inset-0 z-10"
									onClick={() => setMenuOpen(false)}
								/>
								<div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
									<button
										onClick={(e) => {
											e.stopPropagation();
											handlePreview();
											setMenuOpen(false);
										}}
										className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
									>
										<Eye className="w-4 h-4 mr-3" />
										Preview
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleBuild();
										}}
										disabled={building}
										className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
									>
										{building ? (
											<Loader2 className="w-4 h-4 mr-3 animate-spin" />
										) : (
											<Hammer className="w-4 h-4 mr-3" />
										)}
										Build
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleDownload();
										}}
										disabled={downloading}
										className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
									>
										{downloading ? (
											<Loader2 className="w-4 h-4 mr-3 animate-spin" />
										) : (
											<Download className="w-4 h-4 mr-3" />
										)}
										Download
									</button>
									<div className="border-t border-white/10" />
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleDelete();
										}}
										disabled={deleting}
										className="flex items-center w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors disabled:opacity-50"
									>
										{deleting ? (
											<Loader2 className="w-4 h-4 mr-3 animate-spin" />
										) : (
											<Trash2 className="w-4 h-4 mr-3" />
										)}
										Delete
									</button>
								</div>
							</>
						)}
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

				<div className="flex items-center justify-between text-xs text-gray-500">
					<div className="flex items-center gap-1">
						<Calendar className="w-3.5 h-3.5" />
						<span>{formatDate(project.created_at)}</span>
					</div>
					<div className="flex items-center gap-1">
						<FileCode className="w-3.5 h-3.5" />
						<span>{project.file_count || 0} files</span>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="flex items-center gap-2 mt-4">
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
					>
						<Eye className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
