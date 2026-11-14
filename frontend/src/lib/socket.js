import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3100/api";
const socketUrl = apiUrl.replace(/\/api\/?$/, "");

let socket = null;
let activeToken = null;

/** Return the current Socket.IO client, if one has been created. */
export function getSocket() {
	return socket;
}

/** Connect the authenticated user to the realtime backend. */
export function connectSocket(token) {
	if (socket && activeToken === token) {
		if (!socket.connected) socket.connect();
		return socket;
	}

	disconnectSocket();
	activeToken = token;
	socket = io(socketUrl, {
		withCredentials: true,
		// The backend can authenticate either this token or the httpOnly cookie.
		auth: token ? { token } : {},
	});

	return socket;
}

/** Disconnect and discard the current client. */
export function disconnectSocket() {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
	activeToken = null;
}
