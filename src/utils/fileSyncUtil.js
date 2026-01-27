/**
 * Utility functions for syncing files between editor and preview
 */

/**
 * Convert file tree to flat file map
 */
export function fileTreeToMap(tree, prefix = "") {
	const fileMap = {};

	const traverse = (nodes, currentPrefix) => {
		nodes.forEach((node) => {
			const path = currentPrefix ? `${currentPrefix}/${node.name}` : node.name;

			if (node.type === "file") {
				fileMap[path] = "";
			} else if (node.type === "directory" && node.children) {
				traverse(node.children, path);
			}
		});
	};

	traverse(tree, prefix);
	return fileMap;
}

/**
 * Load all file contents
 */
export async function loadAllFileContents(projectId, fileTree, api) {
	const fileMap = fileTreeToMap(fileTree);
	const filePaths = Object.keys(fileMap);

	// Load files in parallel (with concurrency limit)
	const concurrency = 5;
	const results = {};

	for (let i = 0; i < filePaths.length; i += concurrency) {
		const batch = filePaths.slice(i, i + concurrency);
		const batchResults = await Promise.all(
			batch.map(async (path) => {
				try {
					const fileData = await api.getFile(projectId, path);
					return {path, content: fileData.content || ""};
				} catch (error) {
					console.error(`Failed to load ${path}:`, error);
					return {path, content: ""};
				}
			}),
		);

		batchResults.forEach(({path, content}) => {
			results[path] = content;
		});
	}

	return results;
}

/**
 * Filter files for Sandpack (only necessary files)
 */
export function filterFilesForSandpack(files) {
	const filtered = {};

	Object.entries(files).forEach(([path, content]) => {
		// Skip certain files
		if (
			path.includes("node_modules") ||
			path.includes(".git") ||
			path.includes("build") ||
			path.includes("dist") ||
			path.endsWith(".md") ||
			path.endsWith(".txt")
		) {
			return;
		}

		// Include source files
		if (
			path.startsWith("src/") ||
			path.startsWith("public/") ||
			path === "package.json" ||
			path === "index.html"
		) {
			filtered[path] = content;
		}
	});

	return filtered;
}

/**
 * Extract dependencies from package.json
 */
export function extractDependencies(packageJsonContent) {
	try {
		const pkg = JSON.parse(packageJsonContent);
		return {
			...pkg.dependencies,
			...pkg.devDependencies,
		};
	} catch (error) {
		console.error("Failed to parse package.json:", error);
		return {};
	}
}

/**
 * Detect project template
 */
export function detectProjectTemplate(files) {
	const hasTypeScript = Object.keys(files).some(
		(path) => path.endsWith(".ts") || path.endsWith(".tsx"),
	);

	const hasReact = Object.keys(files).some(
		(path) => path.endsWith(".jsx") || path.endsWith(".tsx"),
	);

	if (hasReact && hasTypeScript) return "react-ts";
	if (hasReact) return "react";
	if (hasTypeScript) return "vanilla-ts";
	return "vanilla";
}

/**
 * Debounce function for file updates
 */
export function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}
