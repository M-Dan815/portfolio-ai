import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext";
import {ProjectProvider} from "./context/ProjectContext";
import {WebSocketProvider} from "./context/WebSocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

// Pages - Map to the components we built
import LandingPage from "./pages/LandingPage"; // Home -> LandingPage
import AuthPage from "./pages/AuthPage"; // Auth -> AuthPage
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";

// Additional pages (create simple placeholders for these)
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import {ToastProvider} from "./components/ui/Toast";
export default function App() {
	return (
		<Router>
			<ToastProvider>
				<ScrollToTop />
				<AuthProvider>
					<ProjectProvider>
						<WebSocketProvider>
							<Routes>
								{/* Public routes */}
								<Route path="/" element={<LandingPage />} />
								<Route path="/auth" element={<AuthPage />} />
								<Route path="/about" element={<About />} />
								<Route path="/privacy" element={<Privacy />} />
								<Route path="/terms" element={<Terms />} />
								<Route path="/contact" element={<Contact />} />

								{/* Protected routes */}
								<Route
									path="/dashboard/*"
									element={
										<ProtectedRoute>
											<Dashboard />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/editor/:projectId"
									element={
										<ProtectedRoute>
											<Editor />
										</ProtectedRoute>
									}
								/>

								{/* Fallback route */}
								<Route path="*" element={<Navigate to="/" replace />} />
							</Routes>
						</WebSocketProvider>
					</ProjectProvider>
				</AuthProvider>
			</ToastProvider>
		</Router>
	);
}
