import React, {useState} from "react";
import {
	Eye,
	Download,
	Globe,
	Trash2,
	ExternalLink,
	Calendar,
	FileText,
	Loader2,
	Check,
	Copy,
} from "lucide-react";
import api from "../api";

export default function PortfolioCard({portfolio, onDelete, onUpdate}) {
	const [publishing, setPublishing] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [copied, setCopied] = useState(false);

	const handlePreview = () => {
		const previewUrl = `${api.baseUrl}/api/portfolio/preview/${portfolio.portfolio_id}`;
		window.open(previewUrl, "_blank");
	};

	const handleDownload = () => {
		const downloadUrl = `${api.baseUrl}/api/portfolio/download/${portfolio.portfolio_id}`;
		window.open(downloadUrl, "_blank");
	};

	const handlePublish = async () => {
		setPublishing(true);
		try {
			const result = await api.publishPortfolio(portfolio.portfolio_id);
			if (onUpdate) {
				onUpdate({
					...portfolio,
					is_published: true,
					hosted_url: result.hosted_url,
				});
			}
		} catch (error) {
			console.error("Failed to publish:", error);
			alert("Failed to publish portfolio");
		} finally {
			setPublishing(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this portfolio?")) return;

		setDeleting(true);
		try {
			await api.deletePortfolio(portfolio.portfolio_id);
			if (onDelete) {
				onDelete(portfolio.portfolio_id);
			}
		} catch (error) {
			console.error("Failed to delete:", error);
			alert("Failed to delete portfolio");
		} finally {
			setDeleting(false);
		}
	};

	const handleCopyUrl = async () => {
		if (portfolio.hosted_url) {
			await navigator.clipboard.writeText(portfolio.hosted_url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const formatDate = (dateStr) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all group">
			{/* Preview Thumbnail */}
			<div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 relative overflow-hidden">
				<iframe
					src={`${api.baseUrl}/api/portfolio/preview/${portfolio.portfolio_id}`}
					className="w-full h-full transform scale-50 origin-top-left pointer-events-none"
					style={{width: "200%", height: "200%"}}
					title="Portfolio Preview"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

				{/* Status Badge */}
				<div className="absolute top-3 right-3">
					{portfolio.is_published ? (
						<span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center">
							<Globe className="w-3 h-3 mr-1" />
							Published
						</span>
					) : (
						<span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
							Draft
						</span>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="p-5">
				<div className="flex items-start justify-between mb-3">
					<div>
						<h3 className="font-semibold text-white mb-1 truncate max-w-48">
							{portfolio.filename}
						</h3>
						<div className="flex items-center text-sm text-gray-400">
							<FileText className="w-3 h-3 mr-1" />
							<span className="truncate max-w-32">{portfolio.original_cv}</span>
						</div>
					</div>
				</div>

				<div className="flex items-center text-xs text-gray-500 mb-4">
					<Calendar className="w-3 h-3 mr-1" />
					{formatDate(portfolio.created_at)}
				</div>

				{/* Published URL */}
				{portfolio.is_published && portfolio.hosted_url && (
					<div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
						<div className="flex items-center justify-between">
							<a
								href={portfolio.hosted_url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-blue-400 hover:text-blue-300 truncate max-w-48 flex items-center"
							>
								<ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
								{portfolio.hosted_url
									.replace("http://", "")
									.replace("https://", "")}
							</a>
							<button
								onClick={handleCopyUrl}
								className="p-1 hover:bg-white/10 rounded transition-colors"
								title="Copy URL"
							>
								{copied ? (
									<Check className="w-4 h-4 text-green-400" />
								) : (
									<Copy className="w-4 h-4 text-gray-400" />
								)}
							</button>
						</div>
					</div>
				)}

				{/* Actions */}
				<div className="flex items-center gap-2">
					<button
						onClick={handlePreview}
						className="flex-1 flex items-center justify-center px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
					>
						<Eye className="w-4 h-4 mr-1" />
						Preview
					</button>
					<button
						onClick={handleDownload}
						className="flex-1 flex items-center justify-center px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
					>
						<Download className="w-4 h-4 mr-1" />
						Download
					</button>
				</div>

				<div className="flex items-center gap-2 mt-2">
					{!portfolio.is_published && (
						<button
							onClick={handlePublish}
							disabled={publishing}
							className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all text-sm disabled:opacity-50"
						>
							{publishing ? (
								<Loader2 className="w-4 h-4 mr-1 animate-spin" />
							) : (
								<Globe className="w-4 h-4 mr-1" />
							)}
							Publish
						</button>
					)}
					<button
						onClick={handleDelete}
						disabled={deleting}
						className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
						title="Delete"
					>
						{deleting ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Trash2 className="w-4 h-4" />
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
