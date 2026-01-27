import React, {useState, useRef, useCallback} from "react";
import {
	Upload,
	FileText,
	X,
	Loader2,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import api from "../api";

export default function UploadSection({onUploadComplete}) {
	const [isDragging, setIsDragging] = useState(false);
	const [file, setFile] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const fileInputRef = useRef(null);

	const handleDragOver = useCallback((e) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback((e) => {
		e.preventDefault();
		setIsDragging(false);

		const droppedFile = e.dataTransfer.files[0];
		if (droppedFile) {
			validateAndSetFile(droppedFile);
		}
	}, []);

	const validateAndSetFile = (selectedFile) => {
		setError(null);
		setSuccess(null);

		const validTypes = [
			"application/pdf",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];
		const validExtensions = [".pdf", ".docx"];

		const fileExtension = selectedFile.name
			.toLowerCase()
			.slice(selectedFile.name.lastIndexOf("."));

		if (
			!validTypes.includes(selectedFile.type) &&
			!validExtensions.includes(fileExtension)
		) {
			setError("Please upload a PDF or DOCX file");
			return;
		}

		if (selectedFile.size > 10 * 1024 * 1024) {
			setError("File size must be less than 10MB");
			return;
		}

		setFile(selectedFile);
	};

	const handleFileSelect = (e) => {
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			validateAndSetFile(selectedFile);
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		setUploading(true);
		setError(null);
		setProgress(0);

		// Simulate progress
		const progressInterval = setInterval(() => {
			setProgress((prev) => Math.min(prev + 10, 90));
		}, 500);

		try {
			const result = await api.generatePortfolio(file);

			clearInterval(progressInterval);
			setProgress(100);
			setSuccess("Portfolio generated successfully!");

			if (onUploadComplete) {
				onUploadComplete(result);
			}

			// Reset after success
			setTimeout(() => {
				setFile(null);
				setProgress(0);
				setSuccess(null);
			}, 3000);
		} catch (err) {
			clearInterval(progressInterval);
			setError(err.message || "Failed to generate portfolio");
			setProgress(0);
		} finally {
			setUploading(false);
		}
	};

	const removeFile = () => {
		setFile(null);
		setError(null);
		setSuccess(null);
		setProgress(0);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-sm">
			<h2 className="text-2xl font-bold text-white mb-2">
				Generate New Portfolio
			</h2>
			<p className="text-gray-400 mb-6">
				Upload your CV and let AI create a stunning portfolio website
			</p>

			{/* Drop Zone */}
			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={() => fileInputRef.current?.click()}
				className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
					isDragging
						? "border-blue-500 bg-blue-500/10"
						: "border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/5"
				}`}
			>
				<input
					ref={fileInputRef}
					type="file"
					accept=".pdf,.docx"
					onChange={handleFileSelect}
					className="hidden"
				/>

				{!file ? (
					<>
						<Upload className="w-12 h-12 mx-auto mb-4 text-blue-400" />
						<p className="text-lg text-white mb-2">
							Drop your resume here or{" "}
							<span className="text-blue-400">browse</span>
						</p>
						<p className="text-sm text-gray-500">
							Supports PDF and DOCX (Max 10MB)
						</p>
					</>
				) : (
					<div className="flex items-center justify-center space-x-3">
						<FileText className="w-10 h-10 text-blue-400" />
						<div className="text-left">
							<p className="text-white font-medium truncate max-w-xs">
								{file.name}
							</p>
							<p className="text-sm text-gray-400">
								{(file.size / 1024 / 1024).toFixed(2)} MB
							</p>
						</div>
						{!uploading && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									removeFile();
								}}
								className="p-1 hover:bg-white/10 rounded-full transition-colors"
							>
								<X className="w-5 h-5 text-gray-400" />
							</button>
						)}
					</div>
				)}
			</div>

			{/* Progress Bar */}
			{uploading && (
				<div className="mt-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm text-gray-400">
							Generating portfolio...
						</span>
						<span className="text-sm text-blue-400">{progress}%</span>
					</div>
					<div className="h-2 bg-slate-700 rounded-full overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
							style={{width: `${progress}%`}}
						/>
					</div>
				</div>
			)}

			{/* Error Message */}
			{error && (
				<div className="mt-4 flex items-center p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
					<AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
					<p className="text-sm text-red-400">{error}</p>
				</div>
			)}

			{/* Success Message */}
			{success && (
				<div className="mt-4 flex items-center p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
					<CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
					<p className="text-sm text-green-400">{success}</p>
				</div>
			)}

			{/* Generate Button */}
			<button
				onClick={handleUpload}
				disabled={!file || uploading}
				className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
			>
				{uploading ? (
					<>
						<Loader2 className="w-5 h-5 mr-2 animate-spin" />
						Generating...
					</>
				) : (
					<>
						<Upload className="w-5 h-5 mr-2" />
						Generate Portfolio
					</>
				)}
			</button>
		</div>
	);
}
