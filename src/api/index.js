const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiService {
	constructor() {
		this.baseUrl = API_BASE_URL;
	}

	// ==================== Token Management ====================

	getToken() {
		return localStorage.getItem("access_token");
	}

	setToken(token) {
		localStorage.setItem("access_token", token);
	}

	removeToken() {
		localStorage.removeItem("access_token");
	}

	// ==================== Base Request ====================

	async request(endpoint, options = {}) {
		const token = this.getToken();

		const headers = {
			...options.headers,
		};

		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}

		if (!(options.body instanceof FormData)) {
			headers["Content-Type"] = "application/json";
		}

		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			...options,
			headers,
		});

		if (response.status === 401) {
			this.removeToken();
			window.location.href = "/auth";
			throw new Error("Unauthorized");
		}

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({detail: "An error occurred"}));
			throw new Error(error.detail || "Request failed");
		}

		// Handle empty responses
		const text = await response.text();
		return text ? JSON.parse(text) : {};
	}

	// ==================== Auth Endpoints ====================

	async signup(email, password, fullName) {
		return this.request("/api/auth/signup", {
			method: "POST",
			body: JSON.stringify({email, password, full_name: fullName}),
		});
	}

	async login(email, password) {
		const response = await this.request("/api/auth/login", {
			method: "POST",
			body: JSON.stringify({email, password}),
		});
		if (response.access_token) {
			this.setToken(response.access_token);
		}
		return response;
	}

	async getMe() {
		return this.request("/api/auth/me");
	}

	async updateMe(data) {
		return this.request("/api/auth/me", {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	logout() {
		this.removeToken();
	}

	// ==================== Project Endpoints ====================

	async createProject(data) {
		return this.request("/api/projects", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async getProjects(skip = 0, limit = 20) {
		return this.request(`/api/projects?skip=${skip}&limit=${limit}`);
	}

	async getProject(projectId) {
		return this.request(`/api/projects/${projectId}`);
	}

	async updateProject(projectId, data) {
		return this.request(`/api/projects/${projectId}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteProject(projectId) {
		return this.request(`/api/projects/${projectId}`, {
			method: "DELETE",
		});
	}

	// ==================== Project Generation ====================

	async generateProjectFromCV(file, options = {}) {
		const formData = new FormData();
		formData.append("file", file);

		const params = new URLSearchParams();
		if (options.name) params.append("name", options.name);
		if (options.theme) params.append("theme", options.theme);
		if (options.color_scheme)
			params.append("color_scheme", options.color_scheme);

		const queryString = params.toString();
		const url = `/api/projects/generate-from-cv${queryString ? `?${queryString}` : ""}`;

		return this.request(url, {
			method: "POST",
			body: formData,
		});
	}

	async generateProjectFromPrompt(prompt, options = {}) {
		return this.request("/api/projects/generate-from-prompt", {
			method: "POST",
			body: JSON.stringify({
				prompt,
				name: options.name,
				project_type: options.project_type || "react",
				theme: options.theme || "modern",
				color_scheme: options.color_scheme || "blue",
			}),
		});
	}

	async getGenerationStatus(projectId) {
		return this.request(`/api/projects/${projectId}/generation-status`);
	}

	async generateComponent(
		projectId,
		description,
		componentName = null,
		targetPath = null,
	) {
		return this.request(`/api/projects/${projectId}/generate-component`, {
			method: "POST",
			body: JSON.stringify({
				description,
				component_name: componentName,
				target_path: targetPath,
			}),
		});
	}

	// ==================== Design Options ====================

	async getDesignOptions() {
		return this.request("/api/design-options");
	}

	async getProjectDesignIdentity(projectId) {
		return this.request(`/api/projects/${projectId}/design-identity`);
	}
	// ==================== File Endpoints ====================

	async getFileTree(projectId) {
		return this.request(`/api/projects/${projectId}/files`);
	}

	async getAllFiles(projectId) {
		return this.request(`/api/projects/${projectId}/files/all`);
	}

	async getFile(projectId, filePath) {
		return this.request(`/api/projects/${projectId}/files/${filePath}`);
	}

	async createFile(projectId, filePath, content = "") {
		return this.request(`/api/projects/${projectId}/files/${filePath}`, {
			method: "POST",
			body: JSON.stringify({path: filePath, content}),
		});
	}

	async updateFile(projectId, filePath, content) {
		return this.request(`/api/projects/${projectId}/files/${filePath}`, {
			method: "PUT",
			body: JSON.stringify({content}),
		});
	}

	async renameFile(projectId, oldPath, newPath) {
		return this.request(`/api/projects/${projectId}/files/${oldPath}/rename`, {
			method: "PATCH",
			body: JSON.stringify({new_path: newPath}),
		});
	}

	async deleteFile(projectId, filePath) {
		return this.request(`/api/projects/${projectId}/files/${filePath}`, {
			method: "DELETE",
		});
	}

	// ==================== Build & Preview ====================

	async buildProject(projectId) {
		return this.request(`/api/projects/${projectId}/build`, {
			method: "POST",
		});
	}

	async getBuildStatus(projectId) {
		return this.request(`/api/projects/${projectId}/build-status`);
	}

	async rebuildProject(projectId) {
		return this.request(`/api/projects/${projectId}/rebuild`, {
			method: "POST",
		});
	}

	getPreviewUrl(projectId) {
		return `${this.baseUrl}/api/projects/${projectId}/preview`;
	}

	async getSandpackFiles(projectId) {
		return this.request(`/api/projects/${projectId}/sandpack-files`);
	}

	// ==================== Download ====================

	async downloadProject(projectId) {
		const token = this.getToken();
		const response = await fetch(
			`${this.baseUrl}/api/projects/${projectId}/download`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (!response.ok) {
			throw new Error("Download failed");
		}

		const blob = await response.blob();
		const filename =
			response.headers
				.get("Content-Disposition")
				?.match(/filename="(.+)"/)?.[1] || `project-${projectId}.zip`;

		// Trigger download
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);

		return {success: true, filename};
	}

	// ==================== Versions ====================

	async createVersion(projectId, message = "") {
		return this.request(
			`/api/projects/${projectId}/versions?message=${encodeURIComponent(message)}`,
			{
				method: "POST",
			},
		);
	}

	async getVersions(projectId, limit = 20) {
		return this.request(`/api/projects/${projectId}/versions?limit=${limit}`);
	}

	async restoreVersion(projectId, versionNumber) {
		return this.request(
			`/api/projects/${projectId}/versions/${versionNumber}/restore`,
			{
				method: "POST",
			},
		);
	}

	// ==================== Legacy Portfolio Endpoints ====================

	async generatePortfolio(file) {
		const formData = new FormData();
		formData.append("file", file);

		return this.request("/api/generate-portfolio", {
			method: "POST",
			body: formData,
		});
	}

	async getPortfolios() {
		return this.request("/api/portfolios");
	}

	async getMyPortfolios() {
		return this.request("/api/portfolios/me");
	}

	// ==================== WebSocket ====================

	getWebSocketUrl(projectId) {
		const wsProtocol = this.baseUrl.startsWith("https") ? "wss" : "ws";
		const wsBase = this.baseUrl.replace(/^https?/, wsProtocol);
		const token = this.getToken();
		return `${wsBase}/ws/projects/${projectId}?token=${token}`;
	}

	async chatWithProject(projectId, message, options = {}) {
		const formData = new FormData();
		formData.append("message", message || "");
		formData.append("auto_apply", options.auto_apply !== false);

		if (options.image_purpose) {
			formData.append("image_purpose", options.image_purpose);
		}

		if (options.image_target_path) {
			formData.append("image_target_path", options.image_target_path);
		}

		if (options.include_files) {
			formData.append("include_files", JSON.stringify(options.include_files));
		}

		// Add images if present
		if (options.images && options.images.length > 0) {
			for (const image of options.images) {
				formData.append("images", image);
			}
		}

		const response = await fetch(
			`${this.baseUrl}/api/projects/${projectId}/chat`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.getToken()}`,
					// Don't set Content-Type - let browser set it with boundary for FormData
				},
				body: formData,
			},
		);

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({detail: "Request failed"}));
			throw new Error(error.detail || "Chat request failed");
		}

		return response.json();
	}

	// Keep the JSON version for non-image requests
	async chatWithProjectJson(projectId, message, options = {}) {
		return this.request(`/api/projects/${projectId}/chat/json`, {
			method: "POST",
			body: JSON.stringify({
				message,
				include_files: options.include_files || null,
				auto_apply: options.auto_apply !== false,
			}),
		});
	}

	async getChatHistory(projectId) {
		return this.request(`/api/projects/${projectId}/chat/history`);
	}

	async clearChatHistory(projectId) {
		return this.request(`/api/projects/${projectId}/chat/history`, {
			method: "DELETE",
		});
	}

	async refreshChatContext(projectId) {
		return this.request(`/api/projects/${projectId}/chat/refresh`, {
			method: "POST",
		});
	}

	async previewChatChanges(projectId, message, includeFiles = null) {
		return this.request(`/api/projects/${projectId}/chat/preview`, {
			method: "POST",
			body: JSON.stringify({
				message,
				include_files: includeFiles,
				auto_apply: false,
			}),
		});
	}

	async applyChatChanges(projectId, changes) {
		return this.request(`/api/projects/${projectId}/chat/apply`, {
			method: "POST",
			body: JSON.stringify({changes}),
		});
	}

	async deployProject(projectId, options = {}) {
		const params = new URLSearchParams();
		params.append("provider", options.provider || "vercel");
		params.append("production", options.production !== false);

		return this.request(`/api/projects/${projectId}/deploy?${params}`, {
			method: "POST",
		});
	}

	async getDeploymentStatus(projectId) {
		return this.request(`/api/projects/${projectId}/deployment`);
	}

	async redeployProject(projectId) {
		return this.request(`/api/projects/${projectId}/redeploy`, {
			method: "POST",
		});
	}

	async undeployProject(projectId) {
		return this.request(`/api/projects/${projectId}/deployment`, {
			method: "DELETE",
		});
	}
}

export const api = new ApiService();
export default api;
