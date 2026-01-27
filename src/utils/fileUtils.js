/**
 * Get file extension from path
 */
export function getFileExtension(path) {
	const parts = path.split(".");
	return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Get file name from path
 */
export function getFileName(path) {
	const parts = path.split("/");
	return parts[parts.length - 1];
}

/**
 * Get directory from path
 */
export function getDirectory(path) {
	const parts = path.split("/");
	parts.pop();
	return parts.join("/") || ".";
}

/**
 * Get language for Monaco editor from file extension
 */
export function getLanguageFromPath(path) {
	const ext = getFileExtension(path);
	const languageMap = {
		js: "javascript",
		jsx: "javascript",
		ts: "typescript",
		tsx: "typescript",
		json: "json",
		html: "html",
		css: "css",
		scss: "scss",
		less: "less",
		md: "markdown",
		markdown: "markdown",
		py: "python",
		sql: "sql",
		xml: "xml",
		yaml: "yaml",
		yml: "yaml",
		svg: "xml",
		sh: "shell",
		bash: "shell",
	};
	return languageMap[ext] || "plaintext";
}

/**
 * Get icon for file type
 */
export function getFileIcon(path) {
	const ext = getFileExtension(path);
	const fileName = getFileName(path);

	// Special files
	const specialFiles = {
		"package.json": "📦",
		"package-lock.json": "🔒",
		"tsconfig.json": "⚙️",
		"vite.config.js": "⚡",
		"tailwind.config.js": "🎨",
		".gitignore": "🙈",
		".env": "🔐",
		"README.md": "📖",
	};

	if (specialFiles[fileName]) {
		return specialFiles[fileName];
	}

	// By extension
	const extIcons = {
		js: "📜",
		jsx: "⚛️",
		ts: "📘",
		tsx: "⚛️",
		css: "🎨",
		scss: "🎨",
		html: "🌐",
		json: "📋",
		md: "📝",
		svg: "🖼️",
		png: "🖼️",
		jpg: "🖼️",
		jpeg: "🖼️",
		gif: "🖼️",
		ico: "🖼️",
	};

	return extIcons[ext] || "📄";
}

/**
 * Build a tree structure from flat file list
 */
export function buildFileTree(files) {
	const tree = {};

	for (const file of files) {
		const parts = file.path.split("/");
		let current = tree;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const isFile = i === parts.length - 1;

			if (isFile) {
				current[part] = {
					type: "file",
					name: part,
					path: file.path,
					...file,
				};
			} else {
				if (!current[part]) {
					current[part] = {
						type: "directory",
						name: part,
						path: parts.slice(0, i + 1).join("/"),
						children: {},
					};
				}
				current = current[part].children;
			}
		}
	}

	return tree;
}

/**
 * Sort file tree (directories first, then files, alphabetically)
 */
export function sortFileTree(tree) {
	const entries = Object.entries(tree);

	entries.sort(([, a], [, b]) => {
		// Directories first
		if (a.type === "directory" && b.type === "file") return -1;
		if (a.type === "file" && b.type === "directory") return 1;
		// Then alphabetically
		return a.name.localeCompare(b.name);
	});

	const sorted = {};
	for (const [key, value] of entries) {
		if (value.type === "directory" && value.children) {
			sorted[key] = {
				...value,
				children: sortFileTree(value.children),
			};
		} else {
			sorted[key] = value;
		}
	}

	return sorted;
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Check if file is an image
 */
export function isImageFile(path) {
	const ext = getFileExtension(path);
	return ["png", "jpg", "jpeg", "gif", "svg", "ico", "webp"].includes(ext);
}

/**
 * Check if file is editable as text
 */
export function isEditableFile(path) {
	const ext = getFileExtension(path);
	const editableExtensions = [
		"js",
		"jsx",
		"ts",
		"tsx",
		"css",
		"scss",
		"less",
		"html",
		"htm",
		"json",
		"md",
		"markdown",
		"txt",
		"xml",
		"svg",
		"yaml",
		"yml",
		"sh",
		"bash",
		"py",
		"sql",
		"env",
		"gitignore",
	];
	return editableExtensions.includes(ext) || ext === "";
}

/**
 * Generate a unique file name if it already exists
 */
export function getUniqueFileName(baseName, existingFiles) {
	if (!existingFiles.includes(baseName)) {
		return baseName;
	}

	const ext = getFileExtension(baseName);
	const nameWithoutExt = baseName.slice(0, -(ext.length + 1));

	let counter = 1;
	let newName;

	do {
		newName = ext
			? `${nameWithoutExt}-${counter}.${ext}`
			: `${baseName}-${counter}`;
		counter++;
	} while (existingFiles.includes(newName));

	return newName;
}
