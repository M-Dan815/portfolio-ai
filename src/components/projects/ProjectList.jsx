import React from "react";
import {FolderOpen, Plus, Loader2, AlertCircle, RefreshCw} from "lucide-react";
import ProjectCard from "./ProjectCard";

export default function ProjectList({
	projects,
	loading,
	error,
	onRefresh,
	onCreateNew,
	onDelete,
}) {
	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="text-center">
					<Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
					<p className="text-gray-400">Loading projects...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="text-center">
					<AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
					<p className="text-red-400 mb-4">{error}</p>
					<button
						onClick={onRefresh}
						className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors mx-auto"
					>
						<RefreshCw className="w-4 h-4" />
						Try Again
					</button>
				</div>
			</div>
		);
	}

	if (!projects || projects.length === 0) {
		return (
			<div className="text-center py-20">
				<div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
					<FolderOpen className="w-10 h-10 text-blue-400" />
				</div>
				<h3 className="text-xl font-semibold text-white mb-2">
					No projects yet
				</h3>
				<p className="text-gray-400 mb-8 max-w-md mx-auto">
					Create your first portfolio project by uploading your CV or describing
					what you want.
				</p>
				<button
					onClick={onCreateNew}
					className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold text-white transition-all shadow-lg shadow-blue-500/25"
				>
					<Plus className="w-5 h-5" />
					Create Project
				</button>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{projects.map((project) => (
				<ProjectCard
					key={project.project_id}
					project={project}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
}
