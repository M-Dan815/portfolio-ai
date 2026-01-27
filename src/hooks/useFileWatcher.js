import {useEffect, useRef} from "react";
import {debounce} from "../utils/fileSyncUtil";

/**
 * Hook to watch for file changes and sync with preview
 */
export function useFileWatcher(files, onFilesChange, delay = 300) {
	const previousFiles = useRef(files);

	useEffect(() => {
		// Create debounced update function
		const debouncedUpdate = debounce(() => {
			if (onFilesChange && files !== previousFiles.current) {
				onFilesChange(files);
				previousFiles.current = files;
			}
		}, delay);

		debouncedUpdate();

		return () => {
			// Cleanup
		};
	}, [files, onFilesChange, delay]);
}

/**
 * Hook to detect file changes
 */
export function useFileChanges(fileContents, originalContents) {
	const changedFiles = [];

	Object.keys(fileContents).forEach((path) => {
		if (fileContents[path] !== originalContents[path]) {
			changedFiles.push(path);
		}
	});

	return changedFiles;
}
