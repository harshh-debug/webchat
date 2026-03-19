"use client";
import { User } from "@/context/AppContext";
import {
	LogOut,
	MessageSquare,
	Plus,
	Search,
	UserCircle,
	X,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import moment from "moment";
import ThemeToggle from "./ThemeToggle";

interface ChatSidebarProps {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
	showAllUsers: boolean;
	setShowAllUsers: (show: boolean | ((prev: boolean) => boolean)) => void;
	users: User[] | null;
	loggedInUser: User | null;
	chats: any[] | null;
	selectedUser: string | null;
	setSelectedUser: (userId: string | null) => void;
	handleLogout: () => void;
	createChat: (user: User) => void;
	onlineUsers: string[];
}

const getInitials = (name: string) =>
	name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

const AVATAR_COLORS = [
	"bg-violet-500",
	"bg-blue-500",
	"bg-emerald-500",
	"bg-rose-500",
	"bg-amber-500",
	"bg-cyan-500",
	"bg-pink-500",
	"bg-indigo-500",
];

const getAvatarColor = (id: string) =>
	AVATAR_COLORS[
		id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
			AVATAR_COLORS.length
	];

const ChatSidebar = ({
	sidebarOpen,
	setShowAllUsers,
	setSidebarOpen,
	showAllUsers,
	users,
	loggedInUser,
	chats,
	selectedUser,
	setSelectedUser,
	handleLogout,
	createChat,
	onlineUsers,
}: ChatSidebarProps) => {
	const [searchQuery, setSearchQuery] = useState("");

	return (
		<aside
			className={cn(
				"fixed z-20 sm:static top-0 left-0 h-screen w-[300px] flex flex-col",
				"bg-white dark:bg-[#111318] border-r border-zinc-200 dark:border-white/[0.06]",
				"transform transition-transform duration-300 ease-in-out",
				sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0",
			)}
		>
			{/* ── Header ── */}
			<div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-white/[0.06]">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
						<MessageSquare className="w-4 h-4 text-white" />
					</div>
					<span className="font-semibold text-[15px] text-zinc-900 dark:text-white tracking-tight">
						{showAllUsers ? "New Chat" : "Messages"}
					</span>
				</div>

				<div className="flex items-center gap-1.5">
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"h-8 w-8 rounded-lg text-sm",
							showAllUsers
								? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
								: "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06]",
						)}
						onClick={() => setShowAllUsers((prev) => !prev)}
					>
						{showAllUsers ? (
							<X className="w-4 h-4" />
						) : (
							<Plus className="w-4 h-4" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="sm:hidden h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
						onClick={() => setSidebarOpen(false)}
					>
						<X className="w-4 h-4" />
					</Button>
				</div>
			</div>

			{/* ── Search ── */}
			<div className="px-4 py-3">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
					<Input
						placeholder={
							showAllUsers ? "Search people…" : "Search conversations…"
						}
						className={cn(
							"pl-9 h-9 text-[13px] rounded-lg",
							"bg-zinc-100 dark:bg-white/[0.05] border-transparent",
							"text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400",
							"focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:bg-white dark:focus-visible:bg-white/[0.08]",
							"transition-all duration-150",
						)}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			{/* ── List ── */}
			<ScrollArea className="flex-1 px-2">
				{showAllUsers ? (
					/* ── People to chat ── */
					<div className="py-1 space-y-0.5">
						{users
							?.filter(
								(u) =>
									u._id !== loggedInUser?._id &&
									u.name.toLowerCase().includes(searchQuery.toLowerCase()),
							)
							.map((u) => {
								const isOnline = onlineUsers.includes(u._id);
								return (
									<button
										key={u._id}
										onClick={() => createChat(u)}
										className={cn(
											"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left",
											"hover:bg-zinc-100 dark:hover:bg-white/[0.05]",
											"transition-colors duration-150 group",
										)}
									>
										<div className="relative shrink-0">
											<Avatar className="w-9 h-9">
												<AvatarFallback
													className={cn(
														getAvatarColor(u._id),
														"text-white text-[12px] font-semibold",
													)}
												>
													{getInitials(u.name)}
												</AvatarFallback>
											</Avatar>
											{isOnline && (
												<span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111318]" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100 truncate">
												{u.name}
											</p>
											<p
												className={cn(
													"text-[11px] mt-0.5",
													isOnline ? "text-emerald-500" : "text-zinc-400",
												)}
											>
												{isOnline ? "Active now" : "Offline"}
											</p>
										</div>
									</button>
								);
							})}
					</div>
				) : chats && chats.length > 0 ? (
					/* ── Chat list ── */
					<div className="py-1 space-y-0.5">
						{chats.map((chat) => {
							const latestMessage = chat.chat.latestMessage;
							const isSelected = selectedUser === chat.chat._id;
							const isSentByMe = latestMessage?.sender === loggedInUser?._id;
							const unseenCount = chat.chat.unseenCount || 0;
							const isOnline = onlineUsers.includes(chat.user._id);
							const updatedAt = chat.chat.updatedAt;

							return (
								<button
									key={chat.chat._id}
									onClick={() => {
										setSelectedUser(chat.chat._id);
										setSidebarOpen(false);
									}}
									className={cn(
										"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
										"transition-all duration-150",
										isSelected
											? "bg-blue-50 dark:bg-blue-600/10 ring-1 ring-blue-200 dark:ring-blue-500/20"
											: "hover:bg-zinc-100 dark:hover:bg-white/[0.05]",
									)}
								>
									<div className="relative shrink-0">
										<Avatar className="w-10 h-10">
											<AvatarFallback
												className={cn(
													getAvatarColor(chat.user._id),
													"text-white text-[13px] font-semibold",
												)}
											>
												{getInitials(chat.user.name)}
											</AvatarFallback>
										</Avatar>
										{isOnline && (
											<span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111318]" />
										)}
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between gap-1">
											<span
												className={cn(
													"text-[13px] font-semibold truncate",
													isSelected
														? "text-blue-600 dark:text-blue-400"
														: "text-zinc-800 dark:text-zinc-100",
												)}
											>
												{chat.user.name}
											</span>
											<span className="text-[10px] text-zinc-400 shrink-0">
												{updatedAt ? moment(updatedAt).fromNow(true) : ""}
											</span>
										</div>

										<div className="flex items-center justify-between gap-1 mt-0.5">
											<p className="text-[12px] text-zinc-400 dark:text-zinc-500 truncate flex-1">
												{latestMessage
													? `${isSentByMe ? "You: " : ""}${latestMessage.text ?? "📷 Image"}`
													: "Start a conversation"}
											</p>
											{unseenCount > 0 && (
												<Badge className="h-4.5 min-w-[18px] px-1.5 text-[10px] font-bold bg-blue-600 hover:bg-blue-600 text-white rounded-full shrink-0">
													{unseenCount > 99 ? "99+" : unseenCount}
												</Badge>
											)}
										</div>
									</div>
								</button>
							);
						})}
					</div>
				) : (
					/* ── Empty state ── */
					<div className="flex flex-col items-center justify-center h-52 text-center px-4">
						<div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center mb-3">
							<MessageSquare className="w-5 h-5 text-zinc-400" />
						</div>
						<p className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300">
							No conversations yet
						</p>
						<p className="text-[12px] text-zinc-400 mt-1 leading-relaxed">
							Hit <span className="font-semibold text-blue-500">+</span> to
							start a new chat
						</p>
					</div>
				)}
			</ScrollArea>

			<Separator className="bg-zinc-200 dark:bg-white/[0.06]" />

			{/* ── Footer ── */}
			<div className="px-3 py-3 space-y-0.5">
				{loggedInUser && (
					<div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
						<div className="relative shrink-0">
							<Avatar className="w-8 h-8">
								<AvatarFallback
									className={cn(
										getAvatarColor(loggedInUser._id),
										"text-white text-[11px] font-semibold",
									)}
								>
									{getInitials(loggedInUser.name)}
								</AvatarFallback>
							</Avatar>
							<span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111318]" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-100 truncate">
								{loggedInUser.name}
							</p>
							<p className="text-[10px] text-emerald-500">Active</p>
						</div>
					</div>
				)}
				<ThemeToggle />
				<Link
					href="/profile"
					className={cn(
						"flex items-center gap-2.5 px-3 py-2.5 rounded-xl",
						"text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100",
						"hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors duration-150",
					)}
				>
					<UserCircle className="w-4 h-4" />
					<span className="text-[13px] font-medium">Profile</span>
				</Link>

				<button
					onClick={handleLogout}
					className={cn(
						"w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl",
						"text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400",
						"hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150",
					)}
				>
					<LogOut className="w-4 h-4" />
					<span className="text-[13px] font-medium">Sign out</span>
				</button>
			</div>
		</aside>
	);
};

export default ChatSidebar;
