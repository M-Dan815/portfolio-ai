import React, {useState, useEffect} from "react";
import {Cloud, CloudOff, Loader2, Check, AlertCircle} from "lucide-react";

export default function AutoSaveIndicator({
	isSaving,
	lastSaved,
	hasUnsavedChanges,
	autoSaveEnabled = true,
	error,
}) {
	const [timeAgo, setTimeAgo] = useState("");

	useEffect(() => {
		if (!lastSaved) return;

		const updateTimeAgo = () => {
			const seconds = Math.floor((Date.now() - lastSaved) / 1000);

			if (seconds < 5) {
				setTimeAgo("just now");
			} else if (seconds < 60) {
				setTimeAgo(`${seconds}s ago`);
			} else if (seconds < 3600) {
				const minutes = Math.floor(seconds / 60);
				setTimeAgo(`${minutes}m ago`);
			} else {
				const hours = Math.floor(seconds / 3600);
				setTimeAgo(`${hours}h ago`);
			}
		};

		updateTimeAgo();
		const interval = setInterval(updateTimeAgo, 1000);

		return () => clearInterval(interval);
	}, [lastSaved]);

	const getStatus = () => {
		if (error) {
			return {
				icon: AlertCircle,
				color: "text-red-400",
				bg: "bg-red-500/20",
				label: "Save failed",
			};
		} else if (isSaving) {
			return {
				icon: Loader2,
				color: "text-blue-400",
				bg: "bg-blue-500/20",
				label: "Saving...",
				animate: true,
			};
		} else if (hasUnsavedChanges) {
			return {
				icon: CloudOff,
				color: "text-yellow-400",
				bg: "bg-yellow-500/20",
				label: "Unsaved",
			};
		} else if (!autoSaveEnabled) {
			return {
				icon: CloudOff,
				color: "text-gray-400",
				bg: "bg-gray-500/20",
				label: "Auto-save off",
			};
		} else {
			return {
				icon: Check,
				color: "text-green-400",
				bg: "bg-green-500/20",
				label: "Saved",
			};
		}
	};

	const status = getStatus();
	const StatusIcon = status.icon;

	return (
		<div
			className={`flex items-center gap-2 px-3 py-1.5 ${status.bg} rounded-lg`}
		>
			<StatusIcon
				className={`w-4 h-4 ${status.color} ${status.animate ? "animate-spin" : ""}`}
			/>
			<div className="flex items-center gap-2">
				<span className={`text-xs font-medium ${status.color}`}>
					{status.label}
				</span>
				{!isSaving && !hasUnsavedChanges && lastSaved && (
					<span className="text-xs text-gray-500">• {timeAgo}</span>
				)}
			</div>
		</div>
	);
}
