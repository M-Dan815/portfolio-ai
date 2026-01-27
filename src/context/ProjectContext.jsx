import React, {createContext, useContext, useState, useCallback} from "react";
import api from "../api";

const ProjectContext = createContext(null);

export function ProjectProvider({children}) {
	const [projects, setProjects] = useState([]);
	const [currentProject, setCurrentProject] = useState(null);
	const [projectsLoading, setProjectsLoading] = useState(false);
	const [projectsError, setProjectsError] = useState(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationStatus, setGenerationStatus] = useState(null);

	// Fetch all projects
	const fetchProjects = useCallback(async () => {
		setProjectsLoading(true);
		setProjectsError(null);
		try {
			const response = await api.getProjects();
			setProjects(response.projects || []);
		} catch (error) {
			console.error("Failed to fetch projects:", error);
			setProjectsError(error.message);
		} finally {
			setProjectsLoading(false);
		}
	}, []);

	// Create an empty project
	const createProject = useCallback(async (data) => {
		try {
			const project = await api.createProject(data);
			setProjects((prev) => [project, ...prev]);
			return project;
		} catch (error) {
			console.error("Failed to create project:", error);
			throw error;
		}
	}, []);

	// Generate from CV
	const generateFromCV = useCallback(async (file, options = {}) => {
		setIsGenerating(true);
		setGenerationStatus({progress: 0, status: "uploading"});

		try {
			const project = await api.generateProjectFromCV(file, options);
			setProjects((prev) => [project, ...prev]);

			// Start polling for generation status
			pollGenerationStatus(project.project_id);

			return project;
		} catch (error) {
			console.error("Failed to generate from CV:", error);
			setIsGenerating(false);
			setGenerationStatus(null);
			throw error;
		}
	}, []);

	// Generate from prompt
	const generateFromPrompt = useCallback(async (prompt, options = {}) => {
		setIsGenerating(true);
		setGenerationStatus({progress: 0, status: "generating"});

		try {
			const project = await api.generateProjectFromPrompt(prompt, options);
			setProjects((prev) => [project, ...prev]);

			// Start polling for generation status
			pollGenerationStatus(project.project_id);

			return project;
		} catch (error) {
			console.error("Failed to generate from prompt:", error);
			setIsGenerating(false);
			setGenerationStatus(null);
			throw error;
		}
	}, []);

	// Poll generation status
	const pollGenerationStatus = useCallback(
		(projectId) => {
			const interval = setInterval(async () => {
				try {
					const status = await api.getGenerationStatus(projectId);

					setGenerationStatus(status);

					if (status.status === "completed" || status.status === "ready") {
						setIsGenerating(false);
						clearInterval(interval);

						// Refresh projects list
						fetchProjects();
					} else if (status.status === "failed" || status.status === "error") {
						setIsGenerating(false);
						clearInterval(interval);
					}
				} catch (error) {
					console.error("Failed to fetch generation status:", error);
					// Don't stop polling on error, might be temporary
				}
			}, 2000); // Poll every 2 seconds

			// Clean up after 5 minutes
			setTimeout(
				() => {
					clearInterval(interval);
					setIsGenerating(false);
				},
				5 * 60 * 1000,
			);
		},
		[fetchProjects],
	);

	// Update project
	const updateProject = useCallback(
		async (projectId, data) => {
			try {
				const updated = await api.updateProject(projectId, data);

				setProjects((prev) =>
					prev.map((p) => (p.project_id === projectId ? updated : p)),
				);

				if (currentProject?.project_id === projectId) {
					setCurrentProject(updated);
				}

				return updated;
			} catch (error) {
				console.error("Failed to update project:", error);
				throw error;
			}
		},
		[currentProject],
	);

	// Delete project
	const deleteProject = useCallback(
		async (projectId) => {
			try {
				await api.deleteProject(projectId);

				setProjects((prev) => prev.filter((p) => p.project_id !== projectId));

				if (currentProject?.project_id === projectId) {
					setCurrentProject(null);
				}
			} catch (error) {
				console.error("Failed to delete project:", error);
				throw error;
			}
		},
		[currentProject],
	);

	// Get single project
	const getProject = useCallback(async (projectId) => {
		try {
			const project = await api.getProject(projectId);
			setCurrentProject(project);
			return project;
		} catch (error) {
			console.error("Failed to get project:", error);
			throw error;
		}
	}, []);

	const value = {
		// State
		projects,
		currentProject,
		projectsLoading,
		projectsError,
		isGenerating,
		generationStatus,

		// Actions
		fetchProjects,
		createProject,
		generateFromCV,
		generateFromPrompt,
		updateProject,
		deleteProject,
		getProject,
		setCurrentProject, // Export this function
	};

	return (
		<ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
	);
}

export function useProject() {
	const context = useContext(ProjectContext);
	if (!context) {
		throw new Error("useProject must be used within ProjectProvider");
	}
	return context;
}
