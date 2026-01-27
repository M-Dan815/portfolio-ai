import React from "react";
import {Loader2, CheckCircle, AlertCircle, FileCode} from "lucide-react";

export default function GenerationProgress({status}) {
	if (!status) return null;

	const isComplete = status.status === "completed";
	const isFailed = status.status === "failed";
	const isRunning = status.status === "running" || status.status === "pending";

	return (
		<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
			<div className="flex items-center gap-3 mb-4">
				{isRunning && (
					<Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
				)}
				{isComplete && <CheckCircle className="w-6 h-6 text-green-400" />}
				{isFailed && <AlertCircle className="w-6 h-6 text-red-400" />}

				<div>
					<h3 className="font-semibold text-white">
						{isRunning && "Generating Your Portfolio..."}
						{isComplete && "Generation Complete!"}
						{isFailed && "Generation Failed"}
					</h3>
					{status.current_step && isRunning && (
						<p className="text-sm text-gray-400">{status.current_step}</p>
					)}
				</div>
			</div>

			{/* Progress Bar */}
			{isRunning && (
				<div className="mb-4">
					<div className="flex items-center justify-between text-sm mb-2">
						<span className="text-gray-400">Progress</span>
						<span className="text-blue-400">{status.progress || 0}%</span>
					</div>
					<div className="h-2 bg-white/10 rounded-full overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
							style={{width: `${status.progress || 0}%`}}
						/>
					</div>
				</div>
			)}

			{/* Completed Files */}
			{status.completed_files && status.completed_files.length > 0 && (
				<div>
					<p className="text-xs text-gray-500 mb-2">Generated Files:</p>
					<div className="flex flex-wrap gap-2">
						{status.completed_files.slice(0, 8).map((file, index) => (
							<div
								key={index}
								className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg"
							>
								<FileCode className="w-3 h-3 text-green-400" />
								<span className="text-xs text-gray-400">
									{file.split("/").pop()}
								</span>
							</div>
						))}
						{status.completed_files.length > 8 && (
							<span className="text-xs text-gray-500 px-2 py-1">
								+{status.completed_files.length - 8} more
							</span>
						)}
					</div>
				</div>
			)}

			{/* Error Message */}
			{isFailed && status.error_message && (
				<div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
					<p className="text-sm text-red-400">{status.error_message}</p>
				</div>
			)}
		</div>
	);
}
