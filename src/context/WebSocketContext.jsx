import React, {
	createContext,
	useContext,
	useCallback,
	useState,
	useEffect,
} from "react";
import {useWebSocket} from "../hooks/useWebSocket";
import api from "../api";

const WebSocketContext = createContext(null);

export function WebSocketProvider({children}) {
	const [projectId, setProjectId] = useState(null);
	const [wsUrl, setWsUrl] = useState(null);
	const [events, setEvents] = useState([]);
	const [fileUpdates, setFileUpdates] = useState({});

	// Update WebSocket URL when project changes
	useEffect(() => {
		if (projectId) {
			const url = api.getWebSocketUrl(projectId);
			setWsUrl(url);
		} else {
			setWsUrl(null);
		}
	}, [projectId]);

	// Handle incoming messages
	const handleMessage = useCallback((data) => {
		console.log("WebSocket message:", data);

		// Store event
		setEvents((prev) => [...prev.slice(-99), {...data, timestamp: Date.now()}]);

		// Handle different message types
		switch (data.type) {
			case "file_updated":
				setFileUpdates((prev) => ({
					...prev,
					[data.file_path]: {
						content: data.content,
						timestamp: data.timestamp,
						user: data.user,
					},
				}));
				break;

			case "file_created":
			case "file_deleted":
			case "file_renamed":
				// Trigger file tree refresh
				if (data.onFileTreeChange) {
					data.onFileTreeChange();
				}
				break;

			case "build_status":
			case "generation_status":
				// Handle status updates
				break;

			default:
				console.log("Unknown message type:", data.type);
		}
	}, []);

	// Only initialize WebSocket when we have a URL
	const ws = useWebSocket(wsUrl, {
		onMessage: handleMessage,
		reconnect: true,
		reconnectAttempts: 10,
	});

	// Connect to project
	const connectToProject = useCallback((newProjectId) => {
		console.log("Connecting to project:", newProjectId);
		setProjectId(newProjectId);
	}, []);

	// Disconnect from project
	const disconnectFromProject = useCallback(() => {
		console.log("Disconnecting from project");
		setProjectId(null);
		if (ws && ws.disconnect) {
			ws.disconnect();
		}
	}, [ws]);

	// Send file update
	const sendFileUpdate = useCallback(
		(filePath, content) => {
			if (ws && ws.sendMessage) {
				ws.sendMessage({
					type: "file_update",
					file_path: filePath,
					content,
				});
			}
		},
		[ws],
	);

	// Send build request
	const sendBuildRequest = useCallback(() => {
		if (ws && ws.sendMessage) {
			ws.sendMessage({
				type: "build_request",
			});
		}
	}, [ws]);

	// Clear file update
	const clearFileUpdate = useCallback((filePath) => {
		setFileUpdates((prev) => {
			const next = {...prev};
			delete next[filePath];
			return next;
		});
	}, []);

	const value = {
		isConnected: ws?.isConnected || false,
		isConnecting: ws?.isConnecting || false,
		connectionError: ws?.connectionError || null,
		reconnectCount: ws?.reconnectCount || 0,
		connectToProject,
		disconnectFromProject,
		sendFileUpdate,
		sendBuildRequest,
		reconnect: ws?.reconnect || (() => {}),
		events,
		fileUpdates,
		clearFileUpdate,
	};

	return (
		<WebSocketContext.Provider value={value}>
			{children}
		</WebSocketContext.Provider>
	);
}

export function useWebSocketContext() {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error(
			"useWebSocketContext must be used within WebSocketProvider",
		);
	}
	return context;
}
