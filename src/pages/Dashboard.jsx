import React, {useState, useEffect} from "react";
import {Routes, Route, Link, useLocation} from "react-router-dom";
import {
	LayoutDashboard,
	FolderOpen,
	Settings,
	Plus,
	Search,
	RefreshCw,
	Loader2,
	User,
	Mail,
	Save,
	CheckCircle,
	AlertCircle,
	Trash2,
	MoreVertical,
	Edit,
	ExternalLink,
} from "lucide-react";
import Header from "../components/Header";
import {useAuth} from "../context/AuthContext";
import {useProject} from "../context/ProjectContext";
import ProjectList from "../components/projects/ProjectList";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import GenerationProgress from "../components/projects/GenerationProgress";
import api from "../api";

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

// ==================== Project Card with Actions ====================

// ==================== Project Card with Actions ====================

function ProjectCard({project, onDelete}) {
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		setDeleting(true);
		try {
			await onDelete(project.project_id);
			setShowDeleteModal(false);
		} catch (error) {
			console.error("Failed to delete project:", error);
		} finally {
			setDeleting(false);
		}
	};

	const statusColors = {
		ready: "bg-green-500/20 text-green-400",
		built: "bg-green-500/20 text-green-400",
		generating: "bg-yellow-500/20 text-yellow-400",
		building: "bg-yellow-500/20 text-yellow-400",
		error: "bg-red-500/20 text-red-400",
		default: "bg-gray-500/20 text-gray-400",
	};

	return (
		<>
			<div className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
				{/* Project Info - Clickable */}
				<Link
					to={`/editor/${project.project_id}`}
					className="flex items-center gap-3 flex-1 min-w-0"
				>
					<div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
						<FolderOpen className="w-5 h-5 text-blue-400" />
					</div>
					<div className="min-w-0">
						<p className="font-medium text-white truncate">{project.name}</p>
						<p className="text-sm text-gray-400">
							{new Date(project.updated_at).toLocaleDateString()}
						</p>
					</div>
				</Link>

				{/* Right side - Status and Actions */}
				<div className="flex items-center gap-3">
					{/* Status Badge */}
					<span
						className={`px-2 py-1 text-xs rounded-full ${
							statusColors[project.status] || statusColors.default
						}`}
					>
						{project.status}
					</span>

					{/* Live Site Link */}
					{project.deploy_url && (
						<a
							href={project.deploy_url}
							target="_blank"
							rel="noopener noreferrer"
							className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
							title="View Live Site"
						>
							<ExternalLink className="w-4 h-4" />
						</a>
					)}

					{/* Edit Button */}
					<Link
						to={`/editor/${project.project_id}`}
						className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
						title="Open Editor"
					>
						<Edit className="w-4 h-4" />
					</Link>

					{/* Delete Button */}
					<button
						onClick={() => setShowDeleteModal(true)}
						className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
						title="Delete Project"
					>
						<Trash2 className="w-4 h-4" />
					</button>
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

// ==================== Dashboard Home ====================

function DashboardHome() {
	const {user} = useAuth();
	const {
		projects,
		projectsLoading,
		fetchProjects,
		isGenerating,
		generationStatus,
		deleteProject,
	} = useProject();
	const [showCreateModal, setShowCreateModal] = useState(false);

	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	const stats = {
		total: projects.length,
		ready: projects.filter((p) => p.status === "ready" || p.status === "built")
			.length,
		generating: projects.filter(
			(p) => p.status === "generating" || p.status === "building",
		).length,
	};

	const recentProjects = projects.slice(0, 6);

	const handleDelete = async (projectId) => {
		await deleteProject(projectId);
	};

	return (
		<div className="space-y-8">
			{/* Welcome Section */}
			<div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-8">
				<h1 className="text-3xl font-bold text-white mb-2">
					Welcome back, {user?.full_name?.split(" ")[0] || "there"}! 👋
				</h1>
				<p className="text-gray-300">
					Create stunning portfolio websites with AI-powered generation.
				</p>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
					<div className="flex items-center justify-between mb-4">
						<FolderOpen className="w-8 h-8 text-blue-400" />
						<span className="text-3xl font-bold text-white">{stats.total}</span>
					</div>
					<p className="text-gray-400">Total Projects</p>
				</div>
				<div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
					<div className="flex items-center justify-between mb-4">
						<CheckCircle className="w-8 h-8 text-green-400" />
						<span className="text-3xl font-bold text-white">{stats.ready}</span>
					</div>
					<p className="text-gray-400">Ready</p>
				</div>
				<div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
					<div className="flex items-center justify-between mb-4">
						<Loader2 className="w-8 h-8 text-yellow-400" />
						<span className="text-3xl font-bold text-white">
							{stats.generating}
						</span>
					</div>
					<p className="text-gray-400">In Progress</p>
				</div>
			</div>

			{/* Generation Progress */}
			{isGenerating && generationStatus && (
				<GenerationProgress status={generationStatus} />
			)}

			{/* Quick Actions + Recent Projects */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Create New */}
				<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
					<h2 className="text-xl font-bold text-white mb-4">
						Create New Project
					</h2>
					<p className="text-gray-400 mb-6">
						Upload your CV or describe yourself to generate a stunning
						portfolio.
					</p>
					<button
						onClick={() => setShowCreateModal(true)}
						className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold text-white transition-all shadow-lg shadow-blue-500/25"
					>
						<Plus className="w-5 h-5" />
						New Project
					</button>
				</div>

				{/* Recent Projects */}
				<div className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-white">Recent Projects</h2>
						<Link
							to="/dashboard/projects"
							className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
						>
							View All
							<span>→</span>
						</Link>
					</div>

					{projectsLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
						</div>
					) : recentProjects.length === 0 ? (
						<div className="text-center py-12">
							<FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
							<p className="text-gray-400">No projects yet</p>
						</div>
					) : (
						<div className="space-y-3">
							{recentProjects.map((project) => (
								<ProjectCard
									key={project.project_id}
									project={project}
									onDelete={handleDelete}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Create Modal */}
			<CreateProjectModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
			/>
		</div>
	);
}

// ==================== Projects List Page ====================

function ProjectsPage() {
	const {
		projects,
		projectsLoading,
		projectsError,
		fetchProjects,
		deleteProject,
		isGenerating,
		generationStatus,
	} = useProject();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	const filteredProjects = projects.filter((p) =>
		p.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleDelete = async (projectId) => {
		await deleteProject(projectId);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-white">Your Projects</h1>
					<p className="text-gray-400">{projects.length} total projects</p>
				</div>
				<button
					onClick={() => setShowCreateModal(true)}
					className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium text-white transition-all"
				>
					<Plus className="w-4 h-4" />
					New Project
				</button>
			</div>

			{/* Generation Progress */}
			{isGenerating && generationStatus && (
				<GenerationProgress status={generationStatus} />
			)}

			{/* Search and Refresh */}
			<div className="flex gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
					<input
						type="text"
						placeholder="Search projects..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
					/>
				</div>
				<button
					onClick={fetchProjects}
					disabled={projectsLoading}
					className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
					title="Refresh"
				>
					<RefreshCw
						className={`w-5 h-5 text-gray-400 ${projectsLoading ? "animate-spin" : ""}`}
					/>
				</button>
			</div>

			{/* Project List */}
			<ProjectList
				projects={filteredProjects}
				loading={projectsLoading}
				error={projectsError}
				onRefresh={fetchProjects}
				onCreateNew={() => setShowCreateModal(true)}
				onDelete={handleDelete}
			/>

			{/* Create Modal */}
			<CreateProjectModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
			/>
		</div>
	);
}

// ==================== Settings Page ====================

function SettingsPage() {
	const {user, updateProfile} = useAuth();
	const [formData, setFormData] = useState({
		full_name: user?.full_name || "",
		email: user?.email || "",
	});
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setMessage(null);

		const result = await updateProfile(formData);

		if (result.success) {
			setMessage({type: "success", text: "Profile updated successfully!"});
		} else {
			setMessage({
				type: "error",
				text: result.error || "Failed to update profile",
			});
		}

		setSaving(false);
	};

	return (
		<div className="max-w-2xl space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
				<p className="text-gray-400">Manage your account settings</p>
			</div>

			{/* Profile Settings */}
			<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
				<h2 className="text-xl font-semibold text-white mb-6">
					Profile Information
				</h2>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Full Name
						</label>
						<div className="relative">
							<User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								type="text"
								value={formData.full_name}
								onChange={(e) =>
									setFormData({...formData, full_name: e.target.value})
								}
								className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Email Address
						</label>
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({...formData, email: e.target.value})
								}
								className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
							/>
						</div>
					</div>

					{message && (
						<div
							className={`flex items-center gap-2 p-4 rounded-xl ${
								message.type === "success"
									? "bg-green-500/20 border border-green-500/30 text-green-400"
									: "bg-red-500/20 border border-red-500/30 text-red-400"
							}`}
						>
							{message.type === "success" ? (
								<CheckCircle className="w-5 h-5" />
							) : (
								<AlertCircle className="w-5 h-5" />
							)}
							{message.text}
						</div>
					)}

					<button
						type="submit"
						disabled={saving}
						className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
					>
						{saving ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							<Save className="w-5 h-5" />
						)}
						Save Changes
					</button>
				</form>
			</div>

			{/* Account Info */}
			<div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8">
				<h2 className="text-xl font-semibold text-white mb-6">
					Account Information
				</h2>

				<div className="space-y-4">
					<div className="flex justify-between py-3 border-b border-white/10">
						<span className="text-gray-400">Account Status</span>
						<span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
							Active
						</span>
					</div>
					<div className="flex justify-between py-3 border-b border-white/10">
						<span className="text-gray-400">Member Since</span>
						<span className="text-white">
							{user?.created_at
								? new Date(user.created_at).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})
								: "N/A"}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

// ==================== Main Dashboard Component ====================

export default function Dashboard() {
	const location = useLocation();

	const sidebarItems = [
		{path: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true},
		{path: "/dashboard/projects", icon: FolderOpen, label: "Projects"},
		{path: "/dashboard/settings", icon: Settings, label: "Settings"},
	];

	const isActive = (path, exact = false) => {
		if (exact) {
			return location.pathname === path;
		}
		return location.pathname.startsWith(path);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
			<Header />

			<div className="flex pt-16">
				{/* Sidebar - Desktop */}
				<aside className="hidden lg:block w-64 min-h-[calc(100vh-4rem)] bg-slate-900/50 border-r border-white/10 p-6">
					<nav className="space-y-2">
						{sidebarItems.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
									isActive(item.path, item.exact)
										? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
										: "text-gray-400 hover:bg-white/10 hover:text-white"
								}`}
							>
								<item.icon className="w-5 h-5" />
								{item.label}
							</Link>
						))}
					</nav>
				</aside>

				{/* Mobile Bottom Nav */}
				<div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 z-40">
					<nav className="flex justify-around py-3">
						{sidebarItems.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
									isActive(item.path, item.exact)
										? "text-blue-400"
										: "text-gray-400"
								}`}
							>
								<item.icon className="w-6 h-6" />
								<span className="text-xs mt-1">{item.label}</span>
							</Link>
						))}
					</nav>
				</div>

				{/* Main Content */}
				<main className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8">
					<Routes>
						<Route index element={<DashboardHome />} />
						<Route path="projects" element={<ProjectsPage />} />
						<Route path="settings" element={<SettingsPage />} />
					</Routes>
				</main>
			</div>
		</div>
	);
}
