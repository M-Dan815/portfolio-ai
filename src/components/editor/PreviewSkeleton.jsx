import React from "react";

export default function PreviewSkeleton() {
	return (
		<div className="h-full bg-slate-950 p-8 animate-pulse">
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
				<div className="h-12 bg-slate-800 rounded-lg w-2/3" />

				{/* Content blocks */}
				<div className="space-y-4">
					<div className="h-32 bg-slate-800 rounded-lg" />
					<div className="h-24 bg-slate-800 rounded-lg w-4/5" />
					<div className="h-40 bg-slate-800 rounded-lg" />
				</div>

				{/* Grid */}
				<div className="grid grid-cols-3 gap-4">
					<div className="h-24 bg-slate-800 rounded-lg" />
					<div className="h-24 bg-slate-800 rounded-lg" />
					<div className="h-24 bg-slate-800 rounded-lg" />
				</div>
			</div>
		</div>
	);
}
