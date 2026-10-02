"use client";

import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";

export const user_service = process.env.NEXT_PUBLIC_USER_SERVICE;
export const chat_service = process.env.NEXT_PUBLIC_CHAT_SERVICE;

export interface User {
	_id: string;
	name: string;
	email: string;
}

export interface Chat {
	_id: string;
	users: string[];
	latestMessage: {
		text: string;
		sender: string;
	};
	createdAt: string;
	updatedAt: string;
	unseenCount?: number;
}

export interface Chats {
	_id: string;
	user: User;
	chat: Chat;
}

interface AppContextType {
	user: User | null;
	loading: boolean;
	chatsLoading: boolean;
	usersLoading: boolean;
	isAuth: boolean;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
	logoutUser: () => Promise<void>;
	fetchUsers: () => Promise<void>;
	fetchChats: () => Promise<void>;
	chats: Chats[] | null;
	users: User[] | null;
	setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
	children: ReactNode;
}

const isUnauthorized = (error: unknown) =>
	axios.isAxiosError(error) && error.response?.status === 401;

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [isAuth, setIsAuth] = useState(false);
	const [chats, setChats] = useState<Chats[] | null>(null);
	const [users, setUsers] = useState<User[] | null>(null);
	const [chatsLoading, setChatsLoading] = useState(false);
	const [usersLoading, setUsersLoading] = useState(false);
	const { data: session, status: sessionStatus } = useSession();
	const didBootstrap = useRef(false);

	const loadUser = useCallback(async (token: string) => {
		try {
			const { data } = await axios.get<User>(`${user_service}/api/v1/me`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setUser(data);
			setIsAuth(true);
			return true;
		} catch (error) {
			if (isUnauthorized(error)) {
				Cookies.remove("token", { path: "/" });
			} else {
				console.error("Unable to restore the current session.", error);
			}
			setUser(null);
			setIsAuth(false);
			return false;
		}
	}, []);

	const loadChats = useCallback(async (token: string) => {
		setChatsLoading(true);
		try {
			const { data } = await axios.get<{ chats: Chats[] }>(
				`${chat_service}/api/v1/chat/all`,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setChats(data.chats);
		} catch (error) {
			if (!isUnauthorized(error)) console.error("Unable to load chats.", error);
		} finally {
			setChatsLoading(false);
		}
	}, []);

	const loadUsers = useCallback(async (token: string) => {
		setUsersLoading(true);
		try {
			const { data } = await axios.get<User[]>(
				`${user_service}/api/v1/user/all`,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setUsers(data);
		} catch (error) {
			if (!isUnauthorized(error)) console.error("Unable to load users.", error);
		} finally {
			setUsersLoading(false);
		}
	}, []);

	const fetchChats = useCallback(async () => {
		const token = Cookies.get("token");
		if (!token) {
			setChats(null);
			return;
		}
		await loadChats(token);
	}, [loadChats]);

	const fetchUsers = useCallback(async () => {
		const token = Cookies.get("token");
		if (!token) {
			setUsers(null);
			return;
		}
		await loadUsers(token);
	}, [loadUsers]);

	const logoutUser = useCallback(async () => {
		const token = Cookies.get("token");
		try {
			await axios.post("/api/logout", null, {
				headers: { Authorization: `Bearer ${token}` },
			});
		} catch {
			// Local logout should still complete if the backend session is unavailable.
		}

		Cookies.remove("token", { path: "/" });
		await signOut({ redirect: false });
		setUser(null);
		setIsAuth(false);
		setChats(null);
		setUsers(null);
		setChatsLoading(false);
		setUsersLoading(false);
	}, []);

	useEffect(() => {
		if (sessionStatus === "loading" || didBootstrap.current) return;
		didBootstrap.current = true;

		async function restoreSession() {
			const sessionToken = session?.backendToken;
			if (sessionToken) {
				Cookies.set("token", sessionToken, { expires: 15, path: "/" });
			}

			const token = sessionToken ?? Cookies.get("token");
			if (!token) {
				setUser(null);
				setIsAuth(false);
				setChats(null);
				setUsers(null);
				setChatsLoading(false);
				setUsersLoading(false);
				setLoading(false);
				return;
			}

			const authenticated = await loadUser(token);
			if (authenticated) {
				const initialDataLoad = Promise.all([loadChats(token), loadUsers(token)]);
				setLoading(false);
				await initialDataLoad;
				return;
			}
			setLoading(false);
		}

		void restoreSession();
	}, [sessionStatus, session?.backendToken, loadUser, loadChats, loadUsers]);

	return (
		<AppContext.Provider
			value={{
				user,
				setUser,
				isAuth,
				setIsAuth,
				loading,
				chatsLoading,
				usersLoading,
				logoutUser,
				fetchChats,
				fetchUsers,
				users,
				setChats,
				chats,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

export const useAppData = (): AppContextType => {
	const context = useContext(AppContext);
	if (!context) throw new Error("useAppData must be used within AppProvider");
	return context;
};
