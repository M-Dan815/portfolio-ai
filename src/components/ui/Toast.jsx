import React, {createContext, useContext, useState, useCallback} from "react";
import {X, CheckCircle, AlertCircle, Info, Loader2} from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({children}) {
	const [toasts, setToasts] = useState([]);

	const addToast = useCallback((toast) => {
		const id = Date.now() + Math.random();
		const newToast = {id, ...toast};

		setToasts((prev) => [...prev, newToast]);

		// Auto remove after duration (default 5s, longer for loading)
		if (toast.type !== "loading") {
			const duration = toast.duration || 5000;
			setTimeout(() => {
				removeToast(id);
			}, duration);
		}

		return id;
	}, []);

	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const updateToast = useCallback((id, updates) => {
		setToasts((prev) =>
			prev.map((t) => (t.id === id ? {...t, ...updates} : t)),
		);

		// If updating to success/error, auto remove after delay
		if (updates.type && updates.type !== "loading") {
			setTimeout(() => {
				removeToast(id);
			}, updates.duration || 5000);
		}
	}, []);

	return (
		<ToastContext.Provider value={{addToast, removeToast, updateToast}}>
			{children}
			<ToastContainer toasts={toasts} onRemove={removeToast} />
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

function ToastContainer({toasts, onRemove}) {
	return (
		<div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full pointer-events-none">
			{toasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
			))}
		</div>
	);
}

function ToastItem({toast, onRemove}) {
	const icons = {
		success: <CheckCircle className="w-5 h-5 text-green-400" />,
		error: <AlertCircle className="w-5 h-5 text-red-400" />,
		info: <Info className="w-5 h-5 text-blue-400" />,
		loading: <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />,
	};

	const backgrounds = {
		success: "bg-green-500/10 border-green-500/30",
		error: "bg-red-500/10 border-red-500/30",
		info: "bg-blue-500/10 border-blue-500/30",
		loading: "bg-blue-500/10 border-blue-500/30",
	};

	return (
		<div
			className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl animate-slide-in ${
				backgrounds[toast.type] || backgrounds.info
			}`}
		>
			<div className="flex-shrink-0 mt-0.5">
				{icons[toast.type] || icons.info}
			</div>

			<div className="flex-1 min-w-0">
				{toast.title && (
					<p className="font-semibold text-white text-sm">{toast.title}</p>
				)}
				{toast.message && (
					<p className="text-gray-300 text-sm mt-0.5">{toast.message}</p>
				)}
				{toast.action && (
					<button
						onClick={toast.action.onClick}
						className="mt-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
					>
						{toast.action.label}
					</button>
				)}
			</div>

			{toast.type !== "loading" && (
				<button
					onClick={() => onRemove(toast.id)}
					className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
				>
					<X className="w-4 h-4 text-gray-400" />
				</button>
			)}
		</div>
	);
}

// Add CSS animation
const style = document.createElement("style");
style.textContent = `
    @keyframes slide-in {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    .animate-slide-in {
        animation: slide-in 0.3s ease-out;
    }
`;
document.head.appendChild(style);
