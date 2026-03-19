"use client";
import { User } from "@/context/AppContext";
import { Menu, MessageSquare, UserCircle } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  user: User | null;
  setSidebarOpen: (open: boolean) => void;
  isTyping: boolean;
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
  "bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-rose-500",
  "bg-amber-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
];

const getAvatarColor = (id: string) =>
  AVATAR_COLORS[
    id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  ];

const ChatHeader = ({
  user,
  setSidebarOpen,
  isTyping,
  onlineUsers,
}: ChatHeaderProps) => {
  const isOnlineUser = user && onlineUsers.includes(user._id);

  return (
    <div className={cn(
      "flex items-center justify-between px-5 py-3.5",
      "border-b border-zinc-200 dark:border-white/[0.06]",
      "bg-white dark:bg-[#111318]",
      "shrink-0"
    )}>
      {/* Mobile menu toggle */}
      <div className="sm:hidden mr-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Open sidebar</TooltipContent>
        </Tooltip>
      </div>

      {user ? (
        /* ── Active chat header ── */
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <Avatar className="w-9 h-9">
              <AvatarFallback
                className={cn(
                  getAvatarColor(user._id),
                  "text-white text-[12px] font-semibold"
                )}
              >
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {isOnlineUser && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111318]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 truncate leading-none">
                {user.name}
              </h2>
              <Badge
                variant="outline"
                className={cn(
                  "h-4 px-1.5 text-[10px] font-medium border rounded-full leading-none",
                  isOnlineUser
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    : "border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-white/[0.04] text-zinc-400"
                )}
              >
                {isOnlineUser ? "Online" : "Offline"}
              </Badge>
            </div>

            {/* Typing / status */}
            <div className="mt-0.5 h-4 flex items-center">
              {isTyping ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-[3px] items-center">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-blue-500 animate-bounce"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-blue-500 font-medium">typing…</span>
                </div>
              ) : (
                <span className={cn(
                  "text-[11px] font-medium",
                  isOnlineUser ? "text-emerald-500" : "text-zinc-400"
                )}>
                  {isOnlineUser ? "Active now" : "Last seen recently"}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── Empty / no chat selected ── */
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-zinc-500 dark:text-zinc-400">
              No conversation selected
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Pick a chat from the sidebar
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;