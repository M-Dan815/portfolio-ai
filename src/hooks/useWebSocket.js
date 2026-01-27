import {useEffect, useRef, useState, useCallback} from "react";

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000]; // Progressive delays
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const HEARTBEAT_TIMEOUT = 5000; // 5 seconds

export function useWebSocket(url, options = {}) {
	const {
		onOpen,
		onClose,
		onError,
		onMessage,
		reconnect = true,
		reconnectAttempts = 5,
	} = options;

	const [isConnected, setIsConnected] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [connectionError, setConnectionError] = useState(null);
	const [reconnectCount, setReconnectCount] = useState(0);

	const wsRef = useRef(null);
	const reconnectTimeoutRef = useRef(null);
	const heartbeatIntervalRef = useRef(null);
	const heartbeatTimeoutRef = useRef(null);
	const messageQueueRef = useRef([]);

	// Send message
	const sendMessage = useCallback((data) => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			try {
				const message = typeof data === "string" ? data : JSON.stringify(data);
				wsRef.current.send(message);
				return true;
			} catch (error) {
				console.error("Failed to send message:", error);
				return false;
			}
		} else {
			// Queue message for when connection is restored
			messageQueueRef.current.push(data);
			return false;
		}
	}, []);

	// Send queued messages
	const sendQueuedMessages = useCallback(() => {
		while (messageQueueRef.current.length > 0) {
			const message = messageQueueRef.current.shift();
			sendMessage(message);
		}
	}, [sendMessage]);

	// Setup heartbeat
	const setupHeartbeat = useCallback(() => {
		// Clear existing intervals
		if (heartbeatIntervalRef.current) {
			clearInterval(heartbeatIntervalRef.current);
		}
		if (heartbeatTimeoutRef.current) {
			clearTimeout(heartbeatTimeoutRef.current);
		}

		heartbeatIntervalRef.current = setInterval(() => {
			if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
				// Send ping
				sendMessage({type: "ping"});

				// Set timeout for pong response
				heartbeatTimeoutRef.current = setTimeout(() => {
					console.warn("Heartbeat timeout - closing connection");
					wsRef.current?.close();
				}, HEARTBEAT_TIMEOUT);
			}
		}, HEARTBEAT_INTERVAL);
	}, [sendMessage]);

	// Handle pong response
	const handlePong = useCallback(() => {
		if (heartbeatTimeoutRef.current) {
			clearTimeout(heartbeatTimeoutRef.current);
		}
	}, []);

	// Connect to WebSocket
	const connect = useCallback(() => {
		// Don't connect if no URL provided
		if (!url) {
			console.log("WebSocket URL not provided - skipping connection");
			return;
		}

		if (
			wsRef.current?.readyState === WebSocket.OPEN ||
			wsRef.current?.readyState === WebSocket.CONNECTING
		) {
			return;
		}

		setIsConnecting(true);
		setConnectionError(null);

		try {
			console.log("Connecting to WebSocket:", url);
			const ws = new WebSocket(url);

			ws.onopen = (event) => {
				console.log("WebSocket connected");
				setIsConnected(true);
				setIsConnecting(false);
				setReconnectCount(0);
				setConnectionError(null);

				// Setup heartbeat
				setupHeartbeat();

				// Send queued messages
				sendQueuedMessages();

				if (onOpen) {
					onOpen(event);
				}
			};

			ws.onclose = (event) => {
				console.log("WebSocket disconnected", event.code, event.reason);
				setIsConnected(false);
				setIsConnecting(false);

				// Clear heartbeat
				if (heartbeatIntervalRef.current) {
					clearInterval(heartbeatIntervalRef.current);
				}
				if (heartbeatTimeoutRef.current) {
					clearTimeout(heartbeatTimeoutRef.current);
				}

				if (onClose) {
					onClose(event);
				}

				// Attempt reconnection
				if (reconnect && reconnectCount < reconnectAttempts) {
					const delay =
						RECONNECT_DELAYS[
							Math.min(reconnectCount, RECONNECT_DELAYS.length - 1)
						];
					console.log(
						`Reconnecting in ${delay}ms (attempt ${reconnectCount + 1}/${reconnectAttempts})`,
					);

					reconnectTimeoutRef.current = setTimeout(() => {
						setReconnectCount((prev) => prev + 1);
						connect();
					}, delay);
				} else if (reconnectCount >= reconnectAttempts) {
					setConnectionError("Failed to connect after multiple attempts");
				}
			};

			ws.onerror = (event) => {
				console.error("WebSocket error:", event);
				setConnectionError("Connection error");

				if (onError) {
					onError(event);
				}
			};

			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);

					// Handle pong
					if (data.type === "pong") {
						handlePong();
						return;
					}

					if (onMessage) {
						onMessage(data);
					}
				} catch (error) {
					console.error("Failed to parse message:", error);
					if (onMessage) {
						onMessage(event.data);
					}
				}
			};

			wsRef.current = ws;
		} catch (error) {
			console.error("Failed to create WebSocket:", error);
			setIsConnecting(false);
			setConnectionError(error.message);
		}
	}, [
		url,
		reconnect,
		reconnectAttempts,
		reconnectCount,
		onOpen,
		onClose,
		onError,
		onMessage,
		setupHeartbeat,
		sendQueuedMessages,
		handlePong,
	]);

	// Disconnect
	const disconnect = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
		}
		if (heartbeatIntervalRef.current) {
			clearInterval(heartbeatIntervalRef.current);
		}
		if (heartbeatTimeoutRef.current) {
			clearTimeout(heartbeatTimeoutRef.current);
		}

		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		setIsConnected(false);
		setIsConnecting(false);
	}, []);

	// Auto-connect on mount ONLY if URL is provided
	useEffect(() => {
		if (url) {
			connect();
		}

		return () => {
			disconnect();
		};
	}, [url]); // Only reconnect when URL changes

	// Manual reconnect
	const reconnectManually = useCallback(() => {
		if (!url) {
			console.warn("Cannot reconnect - no URL provided");
			return;
		}
		disconnect();
		setReconnectCount(0);
		setTimeout(() => connect(), 100);
	}, [disconnect, connect, url]);

	return {
		isConnected,
		isConnecting,
		connectionError,
		reconnectCount,
		sendMessage,
		connect,
		disconnect,
		reconnect: reconnectManually,
	};
}
