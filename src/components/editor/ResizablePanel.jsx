import React, {useState, useRef, useEffect} from "react";

export default function ResizablePanel({
	left,
	right,
	defaultLeftWidth = 250,
	minLeftWidth = 200,
	maxLeftWidth = 500,
}) {
	const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
	const [isDragging, setIsDragging] = useState(false);
	const containerRef = useRef(null);

	useEffect(() => {
		const handleMouseMove = (e) => {
			if (!isDragging || !containerRef.current) return;

			const containerRect = containerRef.current.getBoundingClientRect();
			const newWidth = e.clientX - containerRect.left;

			if (newWidth >= minLeftWidth && newWidth <= maxLeftWidth) {
				setLeftWidth(newWidth);
			}
		};

		const handleMouseUp = () => {
			setIsDragging(false);
		};

		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
	}, [isDragging, minLeftWidth, maxLeftWidth]);

	return (
		<div ref={containerRef} className="flex h-full overflow-hidden">
			{/* Left Panel */}
			<div
				style={{width: `${leftWidth}px`}}
				className="flex-shrink-0 overflow-hidden"
			>
				{left}
			</div>

			{/* Resizer */}
			<div
				onMouseDown={() => setIsDragging(true)}
				className="w-1 bg-white/5 hover:bg-blue-500/50 cursor-col-resize transition-colors flex-shrink-0"
			/>

			{/* Right Panel */}
			<div className="flex-1 overflow-hidden">{right}</div>
		</div>
	);
}
