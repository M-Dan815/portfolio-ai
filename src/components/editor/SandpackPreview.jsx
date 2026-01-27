import React, {useMemo, useState} from "react";
import {
	SandpackProvider,
	SandpackLayout,
	SandpackPreview as SandpackPreviewComponent,
	SandpackConsole,
	useSandpack,
} from "@codesandbox/sandpack-react";
import {Loader2, AlertCircle, Bug, X, Terminal, RefreshCw} from "lucide-react";

// Debug component to see what Sandpack actually has
function SandpackDebugger() {
	const {sandpack} = useSandpack();

	React.useEffect(() => {
		console.log("=== Sandpack Internal State ===");
		console.log("Files in Sandpack:", Object.keys(sandpack.files));
		console.log("Active file:", sandpack.activeFile);
		Object.entries(sandpack.files).forEach(([path, file]) => {
			console.log(`${path}:`, file.code?.substring(0, 100));
		});
	}, [sandpack.files]);

	return null;
}

export default function SandpackPreview({files, loading, error}) {
	const [showDebug, setShowDebug] = useState(false);
	const [showConsole, setShowConsole] = useState(false);
	const [key, setKey] = useState(0); // Force remount

	const {sandpackFiles, debugInfo} = useMemo(() => {
		const debug = {
			inputFileCount: Object.keys(files || {}).length,
			inputPaths: Object.keys(files || {}),
			outputPaths: [],
			hasApp: false,
			hasEntry: false,
			transformations: [],
			errors: [],
		};

		if (!files || Object.keys(files).length === 0) {
			debug.transformations.push("No files provided, using placeholder");
			return {
				sandpackFiles: getPlaceholderFiles(),
				debugInfo: debug,
			};
		}

		// Start with empty object - we'll build everything we need
		const converted = {};

		// Process each file
		Object.entries(files).forEach(([originalPath, content]) => {
			if (content === undefined || content === null) {
				debug.transformations.push(`Skipped ${originalPath}: no content`);
				return;
			}

			let path = originalPath.replace(/^\/+/, ""); // Remove leading slashes

			// Skip files we don't need
			const skipPatterns = [
				/^vite\.config\./,
				/^postcss\.config\./,
				/^tailwind\.config\./,
				/^tsconfig/,
				/^\.eslint/,
				/^\.git/,
				/^index\.html$/,
				/^public\//,
				/^src\/main\.(jsx?|tsx?)$/,
				/^main\.(jsx?|tsx?)$/,
			];

			if (skipPatterns.some((pattern) => pattern.test(path))) {
				debug.transformations.push(`Skipped: ${path}`);
				return;
			}

			// Remove src/ prefix
			if (path.startsWith("src/")) {
				path = path.substring(4);
			}

			// Fix import paths in content
			let fixedContent = content;
			fixedContent = fixedContent.replace(/from\s+['"]\.\/src\//g, "from './");
			fixedContent = fixedContent.replace(/from\s+['"]src\//g, "from './");
			fixedContent = fixedContent.replace(/from\s+['"]@\//g, "from './");

			const sandpackPath = "/" + path;
			converted[sandpackPath] = {code: fixedContent};
			debug.transformations.push(`${originalPath} → ${sandpackPath}`);
		});

		// Detect App file
		const appFile = converted["/App.jsx"]
			? "/App.jsx"
			: converted["/App.js"]
				? "/App.js"
				: converted["/App.tsx"]
					? "/App.tsx"
					: null;

		debug.hasApp = !!appFile;

		// CRITICAL: We need to provide /App.js (not .jsx) for the template to work
		// OR we need to completely override the template's entry point

		// Approach: Rename App.jsx to App.js and fix all imports
		if (converted["/App.jsx"] && !converted["/App.js"]) {
			converted["/App.js"] = converted["/App.jsx"];
			delete converted["/App.jsx"];
			debug.transformations.push("/App.jsx → /App.js (renamed for Sandpack)");
		}

		// Same for components - rename .jsx to .js
		const jsxFiles = Object.keys(converted).filter((p) => p.endsWith(".jsx"));
		jsxFiles.forEach((jsxPath) => {
			const jsPath = jsxPath.replace(/\.jsx$/, ".js");

			// Update the file content to fix imports
			let content = converted[jsxPath].code;

			// Fix imports in this file - remove .jsx extensions from imports
			content = content.replace(/from\s+['"]([^'"]+)\.jsx['"]/g, "from '$1'");

			converted[jsPath] = {code: content};
			delete converted[jsxPath];
			debug.transformations.push(`${jsxPath} → ${jsPath}`);
		});

		// Also fix imports in all .js files
		Object.keys(converted).forEach((path) => {
			if (path.endsWith(".js")) {
				let content = converted[path].code;
				content = content.replace(/from\s+['"]([^'"]+)\.jsx['"]/g, "from '$1'");
				converted[path] = {code: content};
			}
		});

		// Check for CSS
		const hasIndexCss = !!converted["/index.css"];

		// Create entry point that matches Sandpack's expectations
		converted["/index.js"] = {
			code: `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
${hasIndexCss ? 'import "./index.css";' : ""}
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
		};
		debug.hasEntry = true;
		debug.transformations.push("Created /index.js");

		// Add basic CSS if missing
		if (!hasIndexCss) {
			converted["/index.css"] = {
				code: `*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

html, body, #root {
  height: 100%;
}

body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  font-family: system-ui, -apple-system, sans-serif;
}
`,
			};
			debug.transformations.push("Created /index.css");
		}

		debug.outputPaths = Object.keys(converted);

		console.log("=== Final Sandpack Files ===");
		console.log("Files:", debug.outputPaths);
		console.log("/App.js exists:", !!converted["/App.js"]);
		console.log("/index.js exists:", !!converted["/index.js"]);
		if (converted["/App.js"]) {
			console.log(
				"/App.js content (first 300):",
				converted["/App.js"].code.substring(0, 300),
			);
		}
		if (converted["/index.js"]) {
			console.log("/index.js content:", converted["/index.js"].code);
		}

		return {sandpackFiles: converted, debugInfo: debug};
	}, [files]);

	const forceRefresh = () => {
		setKey((prev) => prev + 1);
	};

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center bg-slate-950">
				<div className="text-center">
					<Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
					<p className="text-gray-400">Loading preview...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-full flex items-center justify-center bg-slate-950 p-8">
				<div className="text-center max-w-md">
					<AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
					<p className="text-red-400 mb-2">Preview Error</p>
					<p className="text-sm text-gray-400">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col bg-slate-950">
			{/* Toolbar */}
			<div className="flex items-center justify-between px-2 py-1 border-b border-white/10 bg-slate-900/50 text-xs">
				<div className="flex items-center gap-2">
					<span className="text-gray-500">
						{debugInfo.outputPaths.length} files
					</span>
					{debugInfo.hasApp ? (
						<span className="text-green-500">✓ App.js</span>
					) : (
						<span className="text-red-500">✗ App</span>
					)}
					{debugInfo.hasEntry ? (
						<span className="text-green-500">✓ index.js</span>
					) : (
						<span className="text-red-500">✗ Entry</span>
					)}
				</div>
				<div className="flex items-center gap-1">
					<button
						onClick={forceRefresh}
						className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10"
						title="Force Refresh"
					>
						<RefreshCw className="w-3.5 h-3.5" />
					</button>
					<button
						onClick={() => setShowConsole(!showConsole)}
						className={`p-1 rounded transition-colors ${
							showConsole
								? "bg-orange-500/20 text-orange-400"
								: "text-gray-400 hover:text-white"
						}`}
						title="Toggle Console"
					>
						<Terminal className="w-3.5 h-3.5" />
					</button>
					<button
						onClick={() => setShowDebug(!showDebug)}
						className={`p-1 rounded transition-colors ${
							showDebug
								? "bg-blue-500/20 text-blue-400"
								: "text-gray-400 hover:text-white"
						}`}
						title="Toggle Debug"
					>
						<Bug className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>

			{/* Debug Panel */}
			{showDebug && (
				<div className="p-3 bg-slate-800 border-b border-white/10 text-xs max-h-48 overflow-auto">
					<div className="flex justify-between items-start mb-2">
						<span className="font-semibold text-white">
							File Transformations
						</span>
						<button onClick={() => setShowDebug(false)}>
							<X className="w-3.5 h-3.5 text-gray-400" />
						</button>
					</div>
					<div className="font-mono text-[10px] space-y-0.5">
						{debugInfo.transformations.map((t, i) => (
							<div key={i} className="text-yellow-400">
								{t}
							</div>
						))}
					</div>
					<div className="mt-2 pt-2 border-t border-white/10">
						<span className="text-gray-400">Final files: </span>
						<span className="text-blue-400">
							{debugInfo.outputPaths.join(", ")}
						</span>
					</div>
				</div>
			)}

			{/* Sandpack */}
			<div className="flex-1 min-h-0 flex flex-col" key={key}>
				<SandpackProvider
					template="react"
					files={sandpackFiles}
					theme="dark"
					options={{
						externalResources: ["https://cdn.tailwindcss.com"],
					}}
					customSetup={{
						dependencies: {
							"lucide-react": "latest",
						},
					}}
				>
					<SandpackDebugger />
					<SandpackLayout
						style={{height: "100%", border: "none", borderRadius: 0}}
					>
						<div
							style={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
								height: "100%",
							}}
						>
							<SandpackPreviewComponent
								style={{flex: 1}}
								showNavigator={false}
								showRefreshButton={true}
								showOpenInCodeSandbox={false}
							/>
							{showConsole && (
								<SandpackConsole
									style={{
										height: "120px",
										borderTop: "1px solid rgba(255,255,255,0.1)",
									}}
									showHeader={false}
								/>
							)}
						</div>
					</SandpackLayout>
				</SandpackProvider>
			</div>
		</div>
	);
}

function getPlaceholderFiles() {
	return {
		"/App.js": {
			code: `export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Loading Preview...</h1>
        <p style={{ color: '#9ca3af' }}>Waiting for files</p>
      </div>
    </div>
  );
}`,
		},
		"/index.js": {
			code: `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
		},
	};
}
