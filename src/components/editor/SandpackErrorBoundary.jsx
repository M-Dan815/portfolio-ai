import React from "react";
import {AlertTriangle, RefreshCw} from "lucide-react";

class SandpackErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {hasError: false, error: null};
	}

	static getDerivedStateFromError(error) {
		return {hasError: true, error};
	}

	componentDidCatch(error, errorInfo) {
		console.error("Sandpack Error:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({hasError: false, error: null});
		if (this.props.onReset) {
			this.props.onReset();
		}
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="h-full flex items-center justify-center bg-slate-950 p-8">
					<div className="text-center max-w-md">
						<AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
						<h3 className="text-xl font-semibold text-white mb-2">
							Preview Crashed
						</h3>
						<p className="text-sm text-gray-400 mb-4">
							{this.state.error?.message ||
								"Something went wrong with the preview"}
						</p>
						<button
							onClick={this.handleReset}
							className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors mx-auto"
						>
							<RefreshCw className="w-4 h-4" />
							Restart Preview
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default SandpackErrorBoundary;
