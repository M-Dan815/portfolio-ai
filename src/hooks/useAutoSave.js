import {useEffect, useRef, useCallback} from "react";
import {debounce} from "../utils/fileSyncUtil";

/**
 * Hook for auto-saving with debouncing and conflict detection
 */
export function useAutoSave({
	data,
	onSave,
	delay = 2000,
	enabled = true,
	onConflict,
}) {
	const previousData = useRef(data);
	const saveTimeoutRef = useRef(null);
	const lastSavedRef = useRef(Date.now());
	const isSavingRef = useRef(false);

	// Debounced save function
	const debouncedSave = useCallback(
		debounce(async (dataToSave) => {
			if (!enabled || isSavingRef.current) return;

			try {
				isSavingRef.current = true;
				await onSave(dataToSave);
				lastSavedRef.current = Date.now();
				previousData.current = dataToSave;
			} catch (error) {
				console.error("Auto-save failed:", error);

				// Check if it's a conflict error
				if (error.status === 409 && onConflict) {
					onConflict(error);
				}
			} finally {
				isSavingRef.current = false;
			}
		}, delay),
		[onSave, enabled, delay, onConflict],
	);

	// Watch for data changes
	useEffect(() => {
		if (!enabled) return;

		// Check if data has changed
		if (JSON.stringify(data) !== JSON.stringify(previousData.current)) {
			debouncedSave(data);
		}
	}, [data, enabled, debouncedSave]);

	// Cleanup
	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, []);

	// Manual save (bypasses debounce)
	const saveNow = useCallback(async () => {
		if (isSavingRef.current) return;

		try {
			isSavingRef.current = true;
			await onSave(data);
			lastSavedRef.current = Date.now();
			previousData.current = data;
		} catch (error) {
			console.error("Manual save failed:", error);
			throw error;
		} finally {
			isSavingRef.current = false;
		}
	}, [data, onSave]);

	return {
		saveNow,
		lastSaved: lastSavedRef.current,
		isSaving: isSavingRef.current,
	};
}
