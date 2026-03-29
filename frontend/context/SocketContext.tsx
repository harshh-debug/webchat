"use client";

import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppData } from "./AppContext";

interface SocketContextType {
	socket: Socket | null;
	onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
	socket: null,
	onlineUsers: [],
});

interface ProviderProps {
	children: ReactNode;
}

export const SocketProvider = ({ children }: ProviderProps) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const { user } = useAppData(); //verify if it works for Oauth
	const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
	const socketUrl=process.env.NEXT_PUBLIC_SOCKET_URL
	if(!socketUrl){
		console.log(`socket url is missing`)
		return 
	}
	useEffect(() => {
		if (!user?._id) return;
		const newSocket = io(socketUrl, {
			path: "/socket.io/",
			query: {
				userId: user._id,
			},
			transports: ["websocket", "polling"],
		});
		setSocket(newSocket);
		newSocket.on("getOnlineUser", (users: string[]) => {
			setOnlineUsers(users);
		});
		return () => {
			newSocket.disconnect();
		};
	}, [user?._id]);
	return (
		<SocketContext.Provider value={{ socket, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};

export const SocketData = () => useContext(SocketContext);
