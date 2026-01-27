import React, {useRef, useEffect, useState} from "react";
import Editor from "@monaco-editor/react";
import {Loader2} from "lucide-react";
import {
	editorOptions,
	customTheme,
	languageConfigs,
} from "../../config/monacoConfig";

// Language detection from file extension
const getLanguageFromPath = (filePath) => {
	if (!filePath) return "plaintext";

	const ext = filePath.split(".").pop()?.toLowerCase();
	const languageMap = {
		js: "javascript",
		jsx: "javascript",
		ts: "typescript",
		tsx: "typescript",
		json: "json",
		html: "html",
		css: "css",
		scss: "scss",
		sass: "sass",
		less: "less",
		md: "markdown",
		py: "python",
		java: "java",
		cpp: "cpp",
		c: "c",
		cs: "csharp",
		php: "php",
		rb: "ruby",
		go: "go",
		rs: "rust",
		sh: "shell",
		bash: "shell",
		yaml: "yaml",
		yml: "yaml",
		xml: "xml",
		svg: "xml",
		sql: "sql",
		graphql: "graphql",
		dockerfile: "dockerfile",
		gitignore: "ignore",
		env: "shell",
	};

	// Check filename for special cases
	const fileName = filePath.split("/").pop()?.toLowerCase();
	if (fileName === "dockerfile") return "dockerfile";
	if (fileName === ".gitignore") return "ignore";
	if (fileName === ".env" || fileName?.startsWith(".env.")) return "shell";

	return languageMap[ext] || "plaintext";
};

// File icon for tab
const getFileIcon = (fileName) => {
	const ext = fileName?.split(".").pop()?.toLowerCase();
	const iconMap = {
		jsx: "⚛️",
		tsx: "⚛️",
		js: "📜",
		ts: "📘",
		css: "🎨",
		scss: "🎨",
		json: "📋",
		md: "📝",
		html: "🌐",
		png: "🖼️",
		jpg: "🖼️",
		svg: "🎨",
		py: "🐍",
		java: "☕",
		cpp: "⚙️",
		go: "🔷",
		rs: "🦀",
		php: "🐘",
		rb: "💎",
	};
	return iconMap[ext] || "📄";
};

export default function MonacoEditor({
	value,
	onChange,
	filePath,
	readOnly = false,
}) {
	const editorRef = useRef(null);
	const [isEditorReady, setIsEditorReady] = useState(false);
	const language = getLanguageFromPath(filePath);

	const handleEditorDidMount = (editor, monaco) => {
		editorRef.current = editor;
		setIsEditorReady(true);

		// Define custom theme
		monaco.editor.defineTheme("custom-dark", customTheme);
		monaco.editor.setTheme("custom-dark");

		// Apply language-specific configuration
		if (languageConfigs[language]) {
			const model = editor.getModel();
			if (model) {
				model.updateOptions(languageConfigs[language]);
			}
		}

		// Add custom keybindings
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
			// Save command will be handled by parent
			const event = new CustomEvent("editor:save");
			window.dispatchEvent(event);
		});

		// Format document on Shift+Alt+F
		editor.addCommand(
			monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
			() => {
				editor.getAction("editor.action.formatDocument")?.run();
			},
		);

		// Enable IntelliSense for JavaScript/TypeScript
		if (["javascript", "typescript"].includes(language)) {
			monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
				noSemanticValidation: false,
				noSyntaxValidation: false,
			});

			monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
				target: monaco.languages.typescript.ScriptTarget.Latest,
				allowNonTsExtensions: true,
				moduleResolution:
					monaco.languages.typescript.ModuleResolutionKind.NodeJs,
				module: monaco.languages.typescript.ModuleKind.CommonJS,
				noEmit: true,
				esModuleInterop: true,
				jsx: monaco.languages.typescript.JsxEmit.React,
				reactNamespace: "React",
				allowJs: true,
				typeRoots: ["node_modules/@types"],
			});

			// Add React type definitions
			const reactTypes = `
        declare module 'react' {
          export function useState<T>(initialState: T): [T, (newState: T) => void];
          export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
          export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
          export function useMemo<T>(factory: () => T, deps: any[]): T;
          export function useRef<T>(initialValue: T): { current: T };
          // Add more as needed
        }
      `;

			monaco.languages.typescript.javascriptDefaults.addExtraLib(
				reactTypes,
				"react.d.ts",
			);
		}
	};

	const handleEditorChange = (value) => {
		if (onChange) {
			onChange(value || "");
		}
	};

	// Handle window resize
	useEffect(() => {
		const handleResize = () => {
			if (editorRef.current) {
				editorRef.current.layout();
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Update language when file changes
	useEffect(() => {
		if (editorRef.current && isEditorReady) {
			const model = editorRef.current.getModel();
			if (model) {
				const monaco = window.monaco;
				if (monaco) {
					monaco.editor.setModelLanguage(model, language);

					// Apply language-specific config
					if (languageConfigs[language]) {
						model.updateOptions(languageConfigs[language]);
					}
				}
			}
		}
	}, [language, isEditorReady]);

	return (
		<div className="h-full w-full">
			<Editor
				height="100%"
				language={language}
				value={value}
				onChange={handleEditorChange}
				onMount={handleEditorDidMount}
				theme="custom-dark"
				options={{
					...editorOptions,
					readOnly,
					automaticLayout: true,
				}}
				loading={
					<div className="flex items-center justify-center h-full bg-slate-950">
						<div className="text-center">
							<Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
							<p className="text-gray-400">Loading editor...</p>
						</div>
					</div>
				}
			/>
		</div>
	);
}

export {getLanguageFromPath, getFileIcon};
